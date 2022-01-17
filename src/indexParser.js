import { uint8toChars } from "./utils";

const indexParser = (dataArrayBuffer) => {
  console.log("dataArrayBuffer", dataArrayBuffer);
  const uint8ArrayBuffer = new Uint8Array(dataArrayBuffer,0, 4);

  console.log("uint8ArrayBuffer", uint8ArrayBuffer);

  let p = 0;
  const h = uint8toChars(uint8ArrayBuffer.slice(p, p + 4));
  console.log("h", h);
  // console.log(uint8toChar(uint8ArrayBuffer[0]))

  return 40;
};

export default indexParser;
