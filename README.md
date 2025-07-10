# json-seq-stream
application/json-seq support stream / async iterator library

## usage

```ts
import { JsonSequenceStream } from "json-seq-stream";

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