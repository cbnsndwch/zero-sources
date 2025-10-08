/**
 * Service for discovering and registering synced query handlers.
 *
 * @remarks
 * This service uses NestJS DiscoveryService to find all methods decorated with
 * `@SyncedQuery` and registers them in a central registry. The TransformQueryService
 * uses this registry to route query requests to the appropriate handler methods.
 *
 * ## Discovery Process
 *
 * 1. **OnModuleInit**: Scan all providers for decorated methods
 * 2. **Metadata Extraction**: Read query name, schema, and auth requirements
 * 3. **Handler Registration**: Store bound method references by query name
 * 4. **Validation**: Ensure no duplicate query names
 *
 * ## Handler Storage
 *
 * Handlers are stored in a Map with:
 * - **Key**: Query name (string)
 * - **Value**: Object containing handler function, metadata, and provider instance
 *
 * @module synced-query-registry.service
 */

import {
    Injectable,
    Logger,
    OnModuleInit,
    type OnApplicationBootstrap,
    type CanActivate,
    type Type,
    ExecutionContext,
    UnauthorizedException
} from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

import type {
    QueryHandler,
    SyncedQueryMetadata
} from './synced-query.decorator.js';
import { SYNCED_QUERY_METADATA } from './synced-query.constants.js';
import {
    getParameterMetadata,
    type SyncedQueryParamMetadata
} from './synced-query-params.decorator.js';
import { SyncedQueryParamType } from './synced-query-params.constants.js';

// NestJS metadata key for guards
const GUARDS_METADATA = '__guards__';

/**
 * Execution context for synced query guards.
 *
 * Provides access to the authenticated user context.
 */
export interface SyncedQueryExecutionContext {
    /**
     * The authenticated user or undefined for anonymous users.
     */
    user: any | undefined;

    /**
     * The query name being executed.
     */
    queryName: string;

    /**
     * The query arguments.
     */
    args: readonly any[];
}

/**
 * Registered query handler with metadata and execution context.
 */
export interface RegisteredQueryHandler {
    /**
     * The handler function to execute (bound to provider instance).
     */
    handler: QueryHandler;

    /**
     * Metadata about the query (name, schema, auth requirements).
     */
    metadata: SyncedQueryMetadata;

    /**
     * The provider instance that owns this handler.
     */
    provider: any;

    /**
     * The name of the method on the provider.
     */
    methodName: string;

    /**
     * Guards to execute before the handler (class-level and method-level).
     */
    guards: Type<CanActivate>[];

    /**
     * Parameter metadata for dependency injection.
     */
    paramMetadata: SyncedQueryParamMetadata[];

    /**
     * Execute the handler with proper context.
     * Executes guards, resolves parameters, then calls the handler.
     */
    execute: (ctx: any | undefined, ...args: any[]) => Promise<any>;
}

/**
 * Service for discovering and managing synced query handlers.
 *
 * This service implements the discovery pattern similar to NestJS microservices,
 * scanning for decorated methods and building a registry of query handlers.
 */
@Injectable()
export class SyncedQueryRegistry
    implements OnModuleInit, OnApplicationBootstrap
{
    private readonly logger = new Logger(SyncedQueryRegistry.name);

    /**
     * Registry of query handlers by query name.
     */
    private readonly handlers = new Map<string, RegisteredQueryHandler>();

    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector
    ) {}

    /**
     * Discover and register all synced query handlers on module initialization.
     */
    async onModuleInit() {
        this.logger.log('Discovering synced query handlers...');
        await this.discoverHandlers();
    }

    /**
     * Log registered handlers after application bootstrap.
     */
    onApplicationBootstrap() {
        this.logRegisteredHandlers();
    }

    /**
     * Get a registered handler by query name.
     *
     * @param queryName - The name of the query to look up
     * @returns The registered handler or undefined if not found
     */
    getHandler(queryName: string): RegisteredQueryHandler | undefined {
        return this.handlers.get(queryName);
    }

    /**
     * Get all registered query names.
     *
     * @returns Array of registered query names
     */
    getQueryNames(): string[] {
        return Array.from(this.handlers.keys());
    }

    /**
     * Check if a query is registered.
     *
     * @param queryName - The name of the query to check
     * @returns True if the query is registered
     */
    hasQuery(queryName: string): boolean {
        return this.handlers.has(queryName);
    }

    /**
     * Get the total number of registered handlers.
     */
    getHandlerCount(): number {
        return this.handlers.size;
    }

    /**
     * Discover all synced query handlers in the application.
     *
     * Scans both providers and controllers for methods decorated with @SyncedQuery.
     *
     * @private
     */
    private async discoverHandlers(): Promise<void> {
        const startTime = Date.now();

        let componentsScanned = 0;
        let handlersFound = 0;

        // Scan both providers and controllers for query handlers
        const providers = this.discoveryService.getProviders();
        const controllers = this.discoveryService.getControllers();
        const allComponents = [...providers, ...controllers];

        for (const wrapper of allComponents) {
            if (!wrapper.instance || !wrapper.metatype) {
                continue;
            }

            componentsScanned++;
            const found = this.scanInstanceForHandlers(wrapper.instance);

            if (found > 0) {
                this.logger.debug(
                    `Found ${found} handler(s) in ${wrapper.metatype.name}`
                );
                handlersFound += found;
            }
        }

        const elapsed = Date.now() - startTime;
        this.logger.log(
            `Discovery complete: Found ${handlersFound} query handlers ` +
                `in ${componentsScanned} components (${elapsed}ms)`
        );
    }

    /**
     * Scan a provider or controller instance for synced query handlers.
     *
     * @private
     * @returns Number of handlers found
     */
    private scanInstanceForHandlers(instance: any): number {
        let handlersFound = 0;

        // Get all method names on the instance
        const methodNames = this.metadataScanner.getAllMethodNames(
            Object.getPrototypeOf(instance)
        );

        for (const methodName of methodNames) {
            const method = instance[methodName];

            // Check if method has synced query metadata
            const metadata = this.reflector.get<SyncedQueryMetadata>(
                SYNCED_QUERY_METADATA,
                method
            );

            if (!metadata) {
                continue;
            }

            // Register the handler
            this.registerHandler(metadata, instance, methodName, method);

            handlersFound++;
        }

        return handlersFound;
    }

    /**
     * Register a discovered query handler.
     *
     * @private
     */
    private registerHandler(
        metadata: SyncedQueryMetadata,
        provider: any,
        methodName: string,
        method: Function
    ): void {
        const { queryName } = metadata;

        // Check for duplicate registrations
        if (this.handlers.has(queryName)) {
            const existing = this.handlers.get(queryName)!;
            this.logger.error(
                `Duplicate query handler for "${queryName}". ` +
                    `Already registered by ${existing.provider.constructor.name}.${existing.methodName}, ` +
                    `attempted to register ${provider.constructor.name}.${methodName}`
            );
            throw new Error(
                `Duplicate query handler registration: "${queryName}"`
            );
        }

        // Get guards from class and method
        const classGuards: Type<CanActivate>[] =
            this.reflector.get<Type<CanActivate>[]>(
                GUARDS_METADATA,
                provider.constructor
            ) || [];
        const methodGuards: Type<CanActivate>[] =
            this.reflector.get<Type<CanActivate>[]>(GUARDS_METADATA, method) ||
            [];
        const guards = [...classGuards, ...methodGuards];

        // Get parameter metadata
        const paramMetadata = getParameterMetadata(
            Object.getPrototypeOf(provider),
            methodName
        );

        // Create handler that executes guards, resolves parameters, and calls the method
        const boundHandler: QueryHandler = async (
            ctx: any | undefined,
            ...args: any[]
        ) => {
            // Execute guards
            await this.executeGuards(guards, ctx, queryName, args);

            // Resolve parameters
            const resolvedArgs = this.resolveParameters(
                paramMetadata,
                ctx,
                args
            );

            // Call the handler with resolved parameters
            return method.call(provider, ...resolvedArgs);
        };

        // Create registered handler
        const registered: RegisteredQueryHandler = {
            handler: boundHandler,
            metadata,
            provider,
            methodName,
            guards,
            paramMetadata,
            execute: boundHandler
        };

        // Store in registry
        this.handlers.set(queryName, registered);

        const guardInfo = guards.length > 0 ? ` [${guards.length} guards]` : '';
        const paramInfo =
            paramMetadata.length > 0 ? ` [${paramMetadata.length} params]` : '';
        this.logger.debug(
            `Registered query handler: "${queryName}" -> ` +
                `${provider.constructor.name}.${methodName}()${guardInfo}${paramInfo}`
        );
    }

    /**
     * Execute guards for a query.
     *
     * @private
     */
    private async executeGuards(
        guards: Type<CanActivate>[],
        ctx: any | undefined,
        queryName: string,
        args: readonly any[]
    ): Promise<void> {
        if (guards.length === 0) {
            return;
        }

        // Create execution context
        const context: SyncedQueryExecutionContext = {
            user: ctx,
            queryName,
            args
        };

        // Create a mock ExecutionContext for guards
        const executionContext: ExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => context as any,
                getResponse: () => ({}) as any,
                getNext: () => ({}) as any
            }),
            switchToRpc: () => ({
                getContext: () => ({}) as any,
                getData: () => ({}) as any
            }),
            switchToWs: () => ({
                getClient: () => ({}) as any,
                getData: () => ({}) as any,
                getPattern: () => ({}) as any
            }),
            getClass: () => Object as any,
            getHandler: () => Function as any,
            getArgs: () => [] as any,
            getArgByIndex: () => undefined as any,
            getType: () => 'http' as any
        };

        // Execute each guard
        for (const GuardClass of guards) {
            try {
                // Instantiate the guard (guards are typically injectable)
                const guard = new GuardClass();
                const canActivate = await guard.canActivate(executionContext);

                if (!canActivate) {
                    throw new UnauthorizedException(
                        `Guard ${GuardClass.name} denied access to query "${queryName}"`
                    );
                }
            } catch (error) {
                // Re-throw guard errors
                if (error instanceof Error) {
                    throw error;
                }
                throw new UnauthorizedException(
                    `Guard ${GuardClass.name} failed for query "${queryName}"`
                );
            }
        }
    }

    /**
     * Resolve parameters for a query handler.
     *
     * Maps query arguments to method parameters using @QueryArg metadata.
     * NestJS handles other parameter decorators (@CurrentUser, etc.) automatically.
     *
     * @private
     */
    private resolveParameters(
        paramMetadata: SyncedQueryParamMetadata[],
        ctx: any | undefined,
        args: readonly any[]
    ): any[] {
        // If no parameter metadata, return args as-is
        // NestJS will handle injection of other decorated parameters
        if (paramMetadata.length === 0) {
            return [...args];
        }

        // Build parameters array based on @QueryArg metadata
        const resolvedParams: any[] = [];

        for (const param of paramMetadata) {
            if (param.type === SyncedQueryParamType.QUERY_ARG) {
                const argIndex = param.data;
                resolvedParams[param.parameterIndex] = args[argIndex];
            } else {
                // Unknown parameter type, pass undefined
                resolvedParams[param.parameterIndex] = undefined;
            }
        }

        return resolvedParams;
    }

    /**
     * Log all registered handlers for diagnostics.
     *
     * @private
     */
    private logRegisteredHandlers(): void {
        if (this.handlers.size === 0) {
            this.logger.warn('No synced query handlers registered!');
            return;
        }

        this.logger.log(
            `Registered ${this.handlers.size} synced query handlers:`
        );

        const handlerList = Array.from(this.handlers.entries())
            .map(([name, handler]) => {
                const guardInfo = handler.guards.length > 0 ? ' 🔒' : '';
                return `  ${name}${guardInfo} -> ${handler.provider.constructor.name}.${handler.methodName}()`;
            })
            .join('\n');

        this.logger.log('\n' + handlerList);
    }
}
