function shuffle(arr, size) {
  let currentIndex = arr.length;
  let temporaryIndex;
  let randomizedIndex;

  while (currentIndex) {
    // Pick a remaining element…
    randomizedIndex = Math.floor(Math.random() * currentIndex--);
    // And swap it with the current element.

    temporaryIndex = arr[currentIndex];

    arr[currentIndex] = arr[randomizedIndex];

    arr[randomizedIndex] = temporaryIndex;
  }

  const limitedArr = arr.slice(0, size);
  return limitedArr;
}

export default shuffle;
