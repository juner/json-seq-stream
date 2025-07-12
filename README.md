# json-seq-stream

application/json-seq support stream / async iterator library

## usage

```ts
import { InputJsonSequenceStream as JsonSequenceStream } from "json-seq-stream";

type Value = {
    value: number;
};

const sequenceStream = new JsonSequenceStream<Value>();

const response = await fetch(url);
if (!response.ok) throw new Error();
const readable = response.body!.pipeThrough(sequenceStream);
for await (const value of readable) {
    console.log(value);
}
```

## see also

- rfc7464 - JavaScript Object Notation (JSON) Text Sequences \
[https://datatracker.ietf.org/doc/html/rfc7464](https://datatracker.ietf.org/doc/html/rfc7464)
