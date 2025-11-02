'use client';
import {
    Collapsible,
    CollapsibleContent
} from 'fumadocs-ui/components/ui/collapsible';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { type SyntheticEvent, useEffect, useState, useTransition } from 'react';
import { useLocation } from 'react-router';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';

export interface FeedbackItem {
    opinion: 'good' | 'bad';
    url?: string;
    message: string;
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
    const [previous, setPrevious] = useState<Result | null>(null);
    const [opinion, setOpinion] = useState<'good' | 'bad' | null>(null);
    const [message, setMessage] = useState('');

    const { pathname } = useLocation();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const item = localStorage.getItem(`docs-feedback-${pathname}`);
        if (item === null) {
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

    function submit(e?: SyntheticEvent) {
        if (opinion == null) {
            return;
        }

        startTransition(async () => {
            const feedback: FeedbackItem = {
                opinion,
                message
            };

            void onRateAction(pathname, feedback).then(response => {
                setPrevious({
                    response,
                    ...feedback
                });
                setMessage('');
                setOpinion(null);
            });
        });

        e?.preventDefault();
    }

    const activeOpinion = previous?.opinion ?? opinion;

    return (
        <Collapsible
            className="py-6"
            open={Boolean(opinion || previous)}
            onOpenChange={v => {
                if (!v) {
                    setOpinion(null);
                }
            }}
        >
            <div className="flex flex-row items-center-safe justify-end-safe gap-1">
                <p className="text-sm font-medium pe-2">How was this page?</p>

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
            <CollapsibleContent className="mt-3">
                {previous ? (
                    <div className="px-3 py-6 flex flex-col items-center gap-3 bg-fd-card text-fd-muted-foreground text-sm text-center rounded-xl">
                        <p>Thank you for your feedback!</p>
                    </div>
                ) : (
                    <form
                        className="flex flex-col justify-start items-end-safe gap-3"
                        onSubmit={submit}
                    >
                        <textarea
                            autoFocus
                            required
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="w-full border rounded-lg bg-fd-secondary text-fd-secondary-foreground p-3 resize-none focus-visible:outline-none placeholder:text-fd-muted-foreground"
                            placeholder={
                                activeOpinion === 'good'
                                    ? 'What did you like?'
                                    : 'What could be improved?'
                            }
                            onKeyDown={e => {
                                if (!e.shiftKey && e.key === 'Enter') {
                                    submit(e);
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            variant="outline"
                            className="cursor-pointer w-fit px-3"
                            disabled={isPending}
                        >
                            Submit
                        </Button>
                    </form>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}
