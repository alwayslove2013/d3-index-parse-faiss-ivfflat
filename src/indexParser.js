import { uint8toChars, generateArray } from "./utils";
import {
  MetricType,
  num2MetricType,
  DirectMapType,
  num2DirectMapType,
} from "./enums";

const parserIndex = (dataArrayBuffer) => {
  const indexParser = new MiniIndex(dataArrayBuffer);

  return 40;
};

class MiniIndex {
  constructor(dataArrayBuffer) {
    this.data = dataArrayBuffer;
    this.dataview = new DataView(dataArrayBuffer);
    this.p = 0;
    const index = {};
    this.readIndex(index);
    console.log("index", index);
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
  readUint8() {
    const int8 = this.dataview.getUint8(this.p, true);
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
    if (!Number.isSafeInteger(int64))
      console.warn(int64, "exceeds MAX_SAFE_INTEGER. Precision may be lost");
    return int64;
  }
  readFloat64() {
    const float64 = this.dataview.getFloat64(this.p, true);
    this.p += 8;
    return float64;
  }
  readFloat32Array(n) {
    const res = new Float32Array(this.data.slice(this.p, this.p + n * 4));
    this.p += n * 4;
    return res;
  }
  readInt64Array(n) {
    const res = generateArray(n).map((_) => this.readInt64());
    return res;
  }
  readDummy() {
    const dummy = this.readInt64();
    return dummy;
  }
  readIndexHeader(index) {
    index.d = this.readInt32();
    // console.log("d", index.d);
    index.ntotal = this.readInt64();
    // console.log("ntotal", index.ntotal);
    let dummy_0 = this.readDummy();
    let dummy_1 = this.readDummy();
    console.log("  dummy check", dummy_0 === dummy_1);
    index.isTrained = this.readBool();
    // console.log("isTrained", index.isTrained);
    const metricTypeNum = this.readInt32();
    const metricType = num2MetricType(metricTypeNum);
    index.metricType = metricTypeNum;
    index._metricType = metricType;
    if (
      metricTypeNum !== MetricType.METRIC_L2 &&
      metricTypeNum !== MetricType.METRIC_INNER_PRODUCT
    ) {
      console.warn("metric_type only supports l2 and inner_product.");
    }
  }
  readDirectMap(index) {
    const directMap = {};
    const dmTypeNum = this.readUint8();
    const dmType = num2DirectMapType(dmTypeNum);
    directMap.dmType = dmTypeNum;
    directMap._dmType = dmType;
    if (
      dmTypeNum !== DirectMapType.NoMap
      // && dmTypeNum !== DirectMapType.Array
    ) {
      console.warn("directmap type only supports NoMap.");
    }

    directMap.size = this.readInt64();

    // directMap.array = new BigInt64Array(
    //   this.data.slice(this.p, this.p + index.ntotal * 8)
    // );

    index.directMap = directMap;
  }
  readIvfHeader(index) {
    this.readIndexHeader(index);
    index.nlist = this.readInt64();
    // console.log("nlist", index.nlist);
    index.nprobe = this.readInt64();
    // console.log("nprobe", index.nprobe);
    index.ivf_index = {};
    this.readIndex(index.ivf_index);
    this.readDirectMap(index);
  }
  readXbVectors(index) {
    const size = this.readInt64();
    index._codesSize = size;

    // const codes = new Float32Array(this.data.slice(this.p, this.p + size * 4));
    // // console.log(codes.filter((_, i) => i % index.d === 0).sort());
    // this.p += size * 4;
    const codes = generateArray(index.ntotal).map(_ => this.readFloat32Array(index.d))
    
    index.codes = codes;
  }
  readArrayInvertedListsSizes(inv) {
    inv.listType = this.readH();
    if (inv.listType !== "full") {
      console.warn("inv listType only supports full, not sprs");
    }
    inv.listSizeSize = this.readInt64();
    const listSizes = generateArray(inv.listSizeSize).map((_) =>
      this.readInt64()
    );
    inv.listSizes = listSizes;
    const ids = [];
    const codes = [];
    for (let i = 0; i < inv.nlist; i++) {
      codes.push(
        generateArray(listSizes[i]).map((_) =>
          this.readFloat32Array(inv.codeSize / 4)
        )
      );
      ids.push(this.readInt64Array(listSizes[i]));
    }
    // console.log(ids[0])
    // console.log(codes[0])
    inv.ids = ids;
    inv.codes = codes;
  }
  readInvertedLists(index) {
    // ivf->invlists = ils;
    const inv = {};
    inv.h = this.readH();
    console.log('h', inv.h)
    if (inv.h !== "ilar") {
      console.warn("invlist wrong, ", inv.h);
    }
    inv.nlist = this.readInt64();
    inv.codeSize = this.readInt64();

    this.readArrayInvertedListsSizes(inv);

    index.inv = inv;
  }
  readIndex(index) {
    const h = this.readH();
    console.log("h", h);
    index.h = h;
    if (h === "IwFl") {
      this.readIvfHeader(index);
      index.codeSize = index.d * 32;
      this.readInvertedLists(index);

      console.log('Finished check:', this.p === this.data.byteLength)
    } else if (h === "IxF2" || h === "IxFI") {
      this.readIndexHeader(index);
      this.readXbVectors(index);
    } else {
      console.log("wrong index type:", h);
    }
  }
}

export default parserIndex;
