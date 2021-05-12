export function filterByTarget(array, target) {
  const newArray = [];
  array.forEach(item => {
    const sameTarget = Array.isArray(target)
      ? target.indexOf(item.target) !== -1
      : item.target === target;
    if (sameTarget) {
      newArray.push(item);
    }
  });
  return newArray;
}
