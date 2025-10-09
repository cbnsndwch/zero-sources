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
 */

import {
    ExecutionContext,
    Injectable,
    Logger,
    OnModuleInit,
    UnauthorizedException,
    type CanActivate,
    type OnApplicationBootstrap,
    type Type
} from '@nestjs/common';
import {
    ContextIdFactory,
    DiscoveryService,
    MetadataScanner,
    ModuleRef,
    Reflector
} from '@nestjs/core';
import type { AST } from '@rocicorp/zero';

// Import NestJS internal routing infrastructure for parameter resolution
// These are not in the public API but are stable internal classes
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Internal NestJS module
import { RouteParamsFactory } from '@nestjs/core/router/route-params-factory.js';

import {
    SYNCED_QUERY_METADATA,
    SyncedQueryParamType,
    type QueryHandler,
    type SyncedQueryMetadata,
    type SyncedQueryParamMetadata
} from '../contracts.js';
import { getParameterMetadata } from '../decorators/index.js';

// NestJS metadata keys
const GUARDS_METADATA = '__guards__';
// Custom parameter decorators created with createParamDecorator()
// This constant matches NestJS's CUSTOM_ROUTE_ARGS_METADATA from @nestjs/common/constants
const CUSTOM_ROUTE_ARGS_METADATA = '__customRouteArgs__';

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
     *
     * @param request - The full HTTP request object from Express
     * @param args - The query arguments
     * @returns The transformed AST for the query
     */
    execute: (request: any, ...args: any[]) => Promise<AST>;
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

    /**
     * NestJS Route params factory for resolving parameter decorators.
     * This handles @CurrentUser(), @Body(), @Param(), and all other parameter decorators.
     */
    private readonly routeParamsFactory: RouteParamsFactory;

    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector,
        private readonly moduleRef: ModuleRef
    ) {
        // Initialize NestJS's parameter factory to handle parameter decorators
        this.routeParamsFactory = new RouteParamsFactory();
    }

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
        // const providers = this.discoveryService.getProviders();
        // const allComponents = [...providers, ...controllers];
        const controllers = this.discoveryService.getControllers();

        for (const wrapper of controllers) {
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
            request: any,
            ...args: any[]
        ) => {
            // Execute guards with full request object
            await this.executeGuards(guards, request, queryName, args);

            // Resolve parameters from request and args
            const resolvedArgs = this.resolveParameters(
                paramMetadata,
                request,
                args,
                provider,
                methodName
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
     * @param guards - Array of guard classes to execute
     * @param request - The full HTTP request object from Express
     * @param queryName - The name of the query being executed
     * @param args - The query arguments
     *
     * @private
     */
    private async executeGuards(
        guards: Type<CanActivate>[],
        request: any,
        queryName: string,
        args: readonly any[]
    ): Promise<void> {
        if (guards.length === 0) {
            return;
        }

        // Augment the request with synced query metadata
        // This allows guards to know which query is being executed
        // while still having access to all the original request properties
        // Add custom property for synced query context
        // Guards can use this to implement query-specific authorization
        request.syncedQuery = {
            queryName,
            args
        };

        // Create a proper ExecutionContext from the real HTTP request
        // This allows guards to work exactly as they do in regular controllers
        const executionContext: ExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => request,
                getResponse: () =>
                    ({
                        status: () => ({ json: () => {} }),
                        json: () => {}
                    }) as any,
                getNext: () => (() => {}) as any
            }),
            switchToRpc: () => {
                throw new Error('RPC context not supported for synced queries');
            },
            switchToWs: () => {
                throw new Error(
                    'WebSocket context not supported for synced queries'
                );
            },
            getClass: () => Object as any,
            getHandler: () => Function as any,
            getArgs: () => [request, {}, undefined] as any,
            getArgByIndex: <T = any>(index: number): T => {
                const args = [request, {}, undefined];
                return args[index] as T;
            },
            getType: () => 'http' as any
        };

        // Execute each guard with proper DI
        for (const GuardClass of guards) {
            try {
                // Use ModuleRef to resolve the guard with proper dependency injection
                // This ensures guards get their dependencies (JwtService, ConfigService, etc.)
                const contextId = ContextIdFactory.create();
                const guard = await this.moduleRef.resolve(
                    GuardClass,
                    contextId,
                    { strict: false }
                );

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
     * Uses NestJS's RouteParamsFactory to properly execute all parameter decorators,
     * including custom ones created with createParamDecorator() like @CurrentUser().
     * Also maps query arguments using @QueryArg metadata.
     *
     * @param paramMetadata - Parameter metadata from @QueryArg decorators
     * @param request - The full HTTP request object
     * @param args - The query arguments
     * @param provider - The provider instance
     * @param methodName - The method name
     *
     * @remarks
     * This implementation uses NestJS's internal RouteParamsFactory which properly
     * handles ALL types of parameter decorators by reading ROUTE_ARGS_METADATA from
     * the class constructor, making our synced queries fully compatible with the
     * NestJS ecosystem.
     *
     * @private
     */
    private resolveParameters(
        paramMetadata: SyncedQueryParamMetadata[],
        request: any,
        args: readonly any[],
        provider: any,
        methodName: string
    ): any[] {
        // Get the method
        const method = provider[methodName];
        const paramCount = method.length;

        // If no parameters, return empty array
        if (paramCount === 0) {
            return [];
        }

        // Initialize resolved parameters array
        const resolvedParams: any[] = new Array(paramCount);

        // Read NestJS parameter decorator metadata from the class constructor
        // This is where createParamDecorator() stores its metadata
        // Metadata is stored per-method using the method name as the key
        // Metadata key format within each method: "{uid}__{paramType}__:{index}"
        const paramsMetadata = Reflect.getMetadata(
            '__routeArguments__', // ROUTE_ARGS_METADATA constant
            provider.constructor,
            methodName
        );

        // Create ExecutionContext for parameter decorators
        const executionContext: ExecutionContext = {
            switchToHttp: () => ({
                getRequest: () => request,
                getResponse: () => ({}) as any,
                getNext: () => (() => {}) as any
            }),
            switchToRpc: () => {
                throw new Error('RPC context not supported for synced queries');
            },
            switchToWs: () => {
                throw new Error(
                    'WebSocket context not supported for synced queries'
                );
            },
            getClass: () => provider.constructor as any,
            getHandler: () => method as any,
            getArgs: () => [request, {}, undefined] as any,
            getArgByIndex: <T = any>(index: number): T => {
                const contextArgs = [request, {}, undefined];
                return contextArgs[index] as T;
            },
            getType: () => 'http' as any
        };

        // Execute NestJS parameter decorators if present
        if (paramsMetadata) {
            // Iterate through parameter metadata entries for this method
            // Format: "{uid}__customRouteArgs__:{index}" => { index, factory, data, pipes }
            for (const [key, metadata] of Object.entries(paramsMetadata)) {
                const paramData = metadata as any;
                const paramIndex = paramData.index;

                // Check if this parameter has a factory function (custom decorator)
                if (paramData.factory) {
                    try {
                        // Execute the factory function with the execution context
                        // This is how custom decorators like @CurrentUser() get executed
                        const value = paramData.factory(
                            paramData.data,
                            executionContext
                        );
                        resolvedParams[paramIndex] = value;
                    } catch (error) {
                        this.logger.error(
                            `Error executing parameter decorator at index ${paramIndex}:`,
                            error
                        );
                        throw error;
                    }
                } else {
                    // Built-in decorator (like @Req(), @Body(), @Param(), etc.)
                    // Extract parameter type from key
                    const typeMatch = key.match(/__(\w+)__/);
                    if (typeMatch) {
                        const paramType = typeMatch[1];
                        const value =
                            this.routeParamsFactory.exchangeKeyForValue(
                                paramType as any,
                                paramData.data,
                                {
                                    req: request,
                                    res: {},
                                    next: () => {}
                                }
                            );
                        resolvedParams[paramIndex] = value;
                    }
                }
            }
        }

        // Override with @QueryArg values where specified
        // @QueryArg explicitly maps synced query arguments to parameters
        for (const param of paramMetadata) {
            if (param.type === SyncedQueryParamType.QUERY_ARG) {
                const argIndex = param.data;
                resolvedParams[param.parameterIndex] = args[argIndex];
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

        Array.from(this.handlers.entries())
            .map(([name, handler]) => {
                const guardInfo = handler.guards.length ? '🔒 ' : '';
                return `Registered synced query handler ${guardInfo}${name} -> ${handler.provider.constructor.name}.${handler.methodName}()`;
            })
            .forEach(line => this.logger.log(line));

        this.logger.log(
            `Registered ${this.handlers.size} synced query handlers:`
        );
    }
}
