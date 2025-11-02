import { source } from '@/app/lib/source';
import { getLLMText } from '@/app/lib/get-llm-text';

export async function loader() {
    const scan = source.getPages().map(getLLMText);
    const scanned = await Promise.all(scan);

    return new Response(scanned.join('\n\n'));
}
