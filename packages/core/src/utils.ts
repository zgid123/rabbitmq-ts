import type { ConsumeMessage } from 'amqplib';

interface ICombineOptionsProps {
  joinWith: string;
}

function compact(source: (string | undefined)[]): string[] {
  return source.filter((s) => !!s) as string[];
}

export function combine(
  opts: ICombineOptionsProps | string | undefined = '',
  ...params: (string | undefined)[]
): string {
  let options: ICombineOptionsProps = { joinWith: ' ' };

  if (typeof opts === 'object') {
    options = opts;
  } else {
    params = [opts, ...params];
  }

  const { joinWith } = options;

  return compact(params).join(joinWith);
}

export function parseMessage(message: ConsumeMessage | null): unknown {
  if (!message) {
    return message;
  }

  const { content } = message;
  let rawMessage = content.toString();

  try {
    rawMessage = JSON.parse(rawMessage);
  } catch {
    // do nothing
  }

  return rawMessage;
}
