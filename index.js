const fs = require('fs');
let input = fs.readFileSync('./input.txt').toString();
input = input.split('\n');

const calcAngle = (station, location) => {
  let angle = 0;

  if (station.x === location.x) {
    if (station.y > location.y) {
      angle = 0;
    } else {
      angle = 180;
    }
  } else if (station.y === location.y && station.x < location.x) {
    if (station.x < location.x) {
      angle = 90;
    } else {
      angle = 270;
    }
  } else if (station.x < location.x) {
    angle = (Math.atan2(location.x - station.x, station.y - location.y) * 180) / Math.PI;
  } else {
    angle = 360 + (Math.atan2(location.x - station.x, station.y - location.y) * 180) / Math.PI;
  }

  return angle;
};

const calcLocations = input => {
  let listLocations = [];
  let station = null;

  for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < input[i].length; j++) {
      if (input[i][j] === '#') {
        listLocations.push({ x: j, y: i, asteroidsDetected: 0 });
      } else if (input[i][j] === 'X') {
        station = { x: j, y: i, asteroidsDetected: 0 };
        listLocations.push(station);
      }
    }
  }

  return { list: listLocations, station: station };
};

//used to debug
const printAsteroids = input => {
  let listLocations = calcLocations(input).list;
  let gridAsteroids = [];

  for (let i = 0; i < input.length; i++) {
    let arrayRow = input[i].split('');
    for (let j = 0; j < arrayRow.length; j++) {
      const numAsteroids = calcAsteroids({ x: j, y: i, asteroidsDetected: 0 }, listLocations).count;
      if (numAsteroids > 0) {
        arrayRow[j] = numAsteroids.toString();
      }
    }
    gridAsteroids.push(arrayRow.join(''));
  }

  return gridAsteroids.join('\n');
};

const calcAsteroids = (location, listLocations, validadesLocation = true) => {
  if (validadesLocation) {
    const strListLocations = JSON.stringify(listLocations);
    const strLocation = JSON.stringify(location);

    if (!strListLocations.includes(strLocation)) {
      return { list: [], count: 0 };
    }
  }

  let auxlistDetectedAsteroids = [];
  let listDetectedAsteroids = [];

  for (const loc of listLocations) {
    if ([loc.x, loc.y].toString() !== [location.x, location.y].toString()) {
      const auxX = Math.abs(loc.x - location.x);
      const auxY = Math.abs(loc.y - location.y);
      const distance = auxX + auxY;
      let angle = calcAngle(location, loc);

      auxlistDetectedAsteroids.push({
        distance: distance / 10000,
        x: loc.x,
        y: loc.y,
        angle: angle / 1000
      });
    }
  }

  //sort by distance
  auxlistDetectedAsteroids = auxlistDetectedAsteroids.map(i => JSON.stringify(i)).sort();

  for (const asteroid of auxlistDetectedAsteroids) {
    //if angle is not in the list adds
    const asteroidProps = asteroid.split(',');
    const angle = asteroidProps[asteroidProps.length - 1];

    if (!listDetectedAsteroids.toString().includes(angle)) {
      listDetectedAsteroids.push(asteroid);
    }
  }

  return {
    list: JSON.parse('[' + listDetectedAsteroids + ']'),
    count: listDetectedAsteroids.length
  };
};

const findBestLocation = input => {
  let listLocations = calcLocations(input).list;
  let bestLocation = listLocations[0];

  for (const location of listLocations) {
    location.asteroidsDetected = calcAsteroids(location, listLocations).count;
    if (location.asteroidsDetected > bestLocation.asteroidsDetected) {
      bestLocation = location;
    }
  }

  return bestLocation;
};

const isValidLocation = (location, listLocations) => {
  const strListLocations = JSON.stringify(listLocations);
  const strLocation = JSON.stringify(location);

  if (!strListLocations.includes(strLocation)) {
    return false;
  }
  return true;
};

//used to debug
const printAsteroidsAngles = input => {
  const resultCalcLocations = calcLocations(input);
  const listLocations = resultCalcLocations.list;
  const numRows = input.length;
  const numColumns = input[0].length;
  let station = resultCalcLocations.station;
  let gridAsteroids = [];

  for (let i = 0; i < numRows; i++) {
    let arrayRow = ''.padStart(numColumns, '.').split('');
    for (let j = 0; j < numColumns; j++) {
      if (input[i][j] === 'X') {
        arrayRow[j] = '|..X..|';
      } else if (isValidLocation({ x: j, y: i, asteroidsDetected: 0 }, listLocations)) {
        const angle = calcAngle(station, { x: j, y: i, asteroidsDetected: 0 });

        arrayRow[j] = JSON.stringify([j, i]).padStart(7, '.');
      } else {
        arrayRow[j] = '.......';
      }
    }
    gridAsteroids.push(arrayRow.join(''));
  }

  return gridAsteroids;
};

const findAsteroidToBeVaporized = (betPlace, input) => {
  const resultCalcLocations = calcLocations(input);
  let listLocations = resultCalcLocations.list;
  let station = findBestLocation(input);
  station.asteroidsDetected = 0;

  let count = 0;
  let location = {};

  while (true) {
    let listNextToDestroy = calcAsteroids(station, listLocations, false).list;
    listNextToDestroy = listNextToDestroy
      .map(obj => {
        return JSON.stringify({
          angle: obj.angle,
          x: obj.x,
          y: obj.y
        });
      })
      .sort();

    for (const asteroid of listNextToDestroy) {
      const parsedAsteroid = JSON.parse(asteroid);
      location = parsedAsteroid;
      listLocations = listLocations.filter(i => (i.x === parsedAsteroid.x && i.y === parsedAsteroid.y ? false : true));
      count++;
      //console.log(count, [location.x, location.y]);
      if (count === betPlace) {
        break;
      }
    }

    if (listLocations.length === 1 || count === betPlace) {
      break;
    }
  }

  return Number(location.x) * 100 + Number(location.y);
};

let inputTest2 =
  '.#....#####...#..' +
  '\n' +
  '##...##.#####..##' +
  '\n' +
  '##...#...#.#####.' +
  '\n' +
  '..#.....X...###..' +
  '\n' +
  '..#.#.....#....##';
inputTest2 = inputTest2.split('\n');

let inputTest = 
  '.#..#' + '\n' + '.....' + '\n' + '#####' + '\n' + '....#' + '\n' + '...##';
inputTest = inputTest.split('\n');

//tests part1
//console.log(printAsteroids(inputTest));
//console.log(findBestLocation(inputTest));

//tests part2
//console.log(printAsteroidsAngles(inputTest2));
//console.log(findAsteroidToBeVaporized(200, inputTest2));

console.time('part1')
console.log(findBestLocation(input).asteroidsDetected);
console.timeEnd('part1')
console.time('part2')
console.log(findAsteroidToBeVaporized(200, input));
console.timeEnd('part2')
