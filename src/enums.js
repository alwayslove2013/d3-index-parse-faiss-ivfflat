export const MetricType = {
  METRIC_INNER_PRODUCT: 0, ///< maximum inner product search
  METRIC_L2: 1, ///< squared L2 search
  METRIC_L1: 2, ///< L1 (aka cityblock)
  METRIC_Linf: 3, ///< infinity distance
  METRIC_Lp: 4, ///< L_p distance, p is given by a faiss::Index
  /// metric_arg

  /// some additional metrics defined in scipy.spatial.distance
  METRIC_Canberra: 20,
  METRIC_BrayCurtis: 21,
  METRIC_JensenShannon: 22,
};

export const num2MetricType = (num) => {
  let metrictype = "METRIC_L2";
  for (let type in MetricType) {
    if (MetricType[type] === num) {
      metrictype = type;
    }
  }
  return metrictype;
};
