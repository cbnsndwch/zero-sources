'use client';
import {
    Collapsible,
    CollapsibleContent
} from 'fumadocs-ui/components/ui/collapsible';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import {
    useEffect,
    useRef,
    useState,
    useTransition
} from 'react';
import { useLocation } from 'react-router';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';

export interface FeedbackItem {
    name: string;
    email: string;
    opinion: 'good' | 'bad';
    message: string;
    url?: string;
}

export interface ActionResponse {
    githubUrl: string;
}

interface Result extends FeedbackItem {
    response?: ActionResponse;
}

type FeedbackProps = {
    onRateAction: (
        url: string,
        feedback: FeedbackItem
    ) => Promise<ActionResponse>;
};

export default function Feedback({ onRateAction }: FeedbackProps) {
    const formRef = useRef<HTMLFormElement>(null);

    const [previous, setPrevious] = useState<Result | null>(null);

    const [opinion, setOpinion] = useState<'good' | 'bad' | null>(null);

    const { pathname } = useLocation();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const item = localStorage.getItem(`docs-feedback-${pathname}`);
        if (!item) {
            return;
        }

        setPrevious(JSON.parse(item) as Result);
    }, [pathname]);

    useEffect(() => {
        const key = `docs-feedback-${pathname}`;

        if (previous) {
            localStorage.setItem(key, JSON.stringify(previous));
        } else {
            localStorage.removeItem(key);
        }
    }, [previous, pathname]);

    function submit(e: React.FormEvent<HTMLFormElement>) {
        if (!opinion) {
            return;
        }

        const form = e.target as HTMLFormElement;
        startTransition(async () => {
            const data = Object.fromEntries(new FormData(form).entries());

            const feedback: FeedbackItem = {
                opinion: opinion,
                message: (data.message || '') as string,
                name: (data.name || '') as string,
                email: (data.email || '') as string
            };

            void onRateAction(pathname, feedback).then(response => {
                setPrevious({
                    response,
                    ...feedback
                });

                form.reset();
                setOpinion(null);
            });
        });

        e?.preventDefault();
    }

    const activeOpinion = previous?.opinion ?? opinion;

    if (previous) {
        return (
            <div className="px-3 py-6 flex flex-col items-center gap-3 bg-fd-card text-fd-muted-foreground text-sm text-center rounded-xl">
                <p>Thank you for your feedback!</p>
                {previous.response?.githubUrl && (
                    <a
                        href={previous.response.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-fd-primary hover:underline text-xs"
                    >
                        View on GitHub →
                    </a>
                )}
            </div>
        );
    }

    return (
        <form
            ref={formRef}
            className="w-full flex flex-col justify-stretch items-start gap-3"
            onSubmit={submit}
        >
            <Collapsible
                className="w-full py-6"
                open={Boolean(opinion || previous)}
                onOpenChange={v => {
                    if (v) {
                        const nameInput =
                            document.querySelector<HTMLInputElement>(
                                'input[name="name"]'
                            );

                        nameInput?.scrollIntoView();

                        return;
                    }

                    setOpinion(null);
                }}
            >
                <div className="flex flex-row items-center-safe justify-end-safe self-end-safe gap-1">
                    <p className="text-sm font-medium pe-2">
                        How was this page?
                    </p>

                    <ButtonGroup>
                        <Button
                            variant="outline"
                            disabled={previous !== null}
                            onClick={() => setOpinion('good')}
                            className={cn(
                                'cursor-pointer',
                                activeOpinion === 'good' &&
                                    'bg-accent text-accent-foreground'
                            )}
                        >
                            <ThumbsUp className="size-4" />
                            Good
                        </Button>
                        <Button
                            variant="outline"
                            disabled={previous !== null}
                            onClick={() => setOpinion('bad')}
                            className={cn(
                                'cursor-pointer',
                                activeOpinion === 'bad' &&
                                    'bg-accent text-accent-foreground'
                            )}
                        >
                            <ThumbsDown className="size-4" />
                            Bad
                        </Button>
                    </ButtonGroup>
                </div>
                <CollapsibleContent className="mt-3 flex flex-col gap-1">
                    <div className="w-full space-y-3">
                        <div className="text-xs text-fd-muted-foreground bg-fd-accent/50 p-3 rounded-lg border border-fd-border">
                            <p className="font-semibold mb-1">
                                Privacy Notice:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>
                                    Your contact info will <strong>NOT</strong>{' '}
                                    be made public
                                </li>
                                <li>
                                    Your feedback text will be posted as a
                                    GitHub issue
                                </li>
                                <li>
                                    The issue will be attributed to an
                                    anonymized name
                                </li>
                            </ul>
                            <a
                                href={`https://github.com/cbnsndwch/zero-sources/issues/new?title=[Feedback]%20${encodeURIComponent(pathname)}&labels=documentation,user-feedback`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-fd-primary hover:underline mt-2 inline-block"
                            >
                                Prefer to create the GitHub issue yourself? →
                            </a>
                        </div>
                        <input
                            name="name"
                            type="text"
                            className="w-full border rounded-lg bg-fd-secondary text-fd-secondary-foreground p-3 focus-visible:outline-none placeholder:text-fd-muted-foreground"
                            placeholder="Your name (optional)"
                        />
                        <input
                            name="email"
                            type="email"
                            className="w-full border rounded-lg bg-fd-secondary text-fd-secondary-foreground p-3 focus-visible:outline-none placeholder:text-fd-muted-foreground"
                            placeholder="Your email (optional)"
                        />
                        <textarea
                            required
                            name="message"
                            className="w-full border rounded-lg bg-fd-secondary text-fd-secondary-foreground p-3 resize-none focus-visible:outline-none placeholder:text-fd-muted-foreground"
                            placeholder={
                                activeOpinion === 'good'
                                    ? 'What did you like?'
                                    : 'What could be improved?'
                            }
                            rows={4}
                            onKeyDown={e => {
                                if (!e.shiftKey && e.key === 'Enter') {
                                    formRef.current?.submit();
                                }
                            }}
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="outline"
                        className="cursor-pointer w-fit px-3 self-end-safe"
                        disabled={isPending}
                    >
                        {isPending ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </CollapsibleContent>
            </Collapsible>
        </form>
    );
}
