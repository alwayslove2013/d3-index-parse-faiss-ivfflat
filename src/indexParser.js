import { uint8toChars } from "./utils";
import { MetricType, num2MetricType } from "./enums";

const parserIndex = (dataArrayBuffer) => {
  const indexParser = new MiniIndex(dataArrayBuffer);

  return 40;
};

class MiniIndex {
  constructor(dataArrayBuffer) {
    this.data = dataArrayBuffer;
    this.dataview = new DataView(dataArrayBuffer);
    console.log(this.dataview);
    this.p = 0;
    this.readIndex();
    return 40;
  }
  readH() {
    const uint8Array = [];
    for (let i = 0; i < 4; i++) {
      uint8Array.push(this.dataview.getUint8(this.p, true));
      this.p += 1;
    }
    const h = uint8toChars(uint8Array);
    return h;
  }
  readInt8() {
    const int8 = this.dataview.getInt8(this.p, true);
    this.p += 1;
    return int8;
  }
  readBool() {
    const int8 = this.readInt8();
    return Boolean(int8);
  }
  readInt32() {
    const int32 = this.dataview.getInt32(this.p, true);
    this.p += 4;
    return int32;
  }
  readInt64() {
    const left = this.readInt32();
    const right = this.readInt32();
    const int64 = left + Math.pow(2, 32) * right;
    console.log("left", left, "right", right);
    if (!Number.isSafeInteger(int64))
      console.warn(int64, "exceeds MAX_SAFE_INTEGER. Precision may be lost");
    return int64;
  }
  readDummy() {
    const dummy = this.readInt64();
    return dummy;
  }
  readIvfHeader() {
    this.d = this.readInt32();
    console.log("d", this.p, this.d);
    this.ntotal = this.readInt64();
    console.log("ntotal", this.p, this.ntotal);
    let dummy = this.readDummy();
    console.log("dummy", this.p, dummy);
    dummy = this.readDummy();
    console.log("dummy", this.p, dummy);
    this.isTrained = this.readBool();
    console.log("isTrained", this.p, this.isTrained);
    const metricTypeValue = this.readInt32();
    this.metricType = num2MetricType(metricTypeValue);
    if (metricTypeValue > 1) {
      console.log("metric_type only supports l2 and inner_product. ")
    }
    console.log("metricType", this.p, this.metricType);
  }
  readIndex() {
    const h = this.readH();
    console.log("h", this.p, h);
    if (h === "IwFl") {
      this.readIvfHeader();
    } else {
      console.log("wrong index type:", h);
    }
  }
}

export default parserIndex;
