const pinchScalePerLevel = 1.25

export function getPinchZoomIndex(startIndex: number, startDistance: number, currentDistance: number, levelCount: number) {
  if (startDistance <= 0 || currentDistance <= 0 || levelCount <= 0) return 0

  const zoomSteps = Math.round(Math.log(currentDistance / startDistance) / Math.log(pinchScalePerLevel))
  return Math.max(0, Math.min(levelCount - 1, startIndex + zoomSteps))
}
