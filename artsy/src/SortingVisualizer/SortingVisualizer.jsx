import React from 'react';
import {getMergeSortAnimations} from '../sortingAlgorithms/sortingAlgorithms.js';
import './SortingVisualizer.css';
import Sketch from "react-p5";
import ReactDOM from 'react-dom';

// Change this value for the speed of the animations.
const ANIMATION_SPEED_MS = 1;

// Change this value for the number of bars (value) in the array.
const NUMBER_OF_ARRAY_BARS = 310;

// This is the main color of the array bars.
const PRIMARY_COLOR = 'turquoise';

// This is the color of array bars that are being compared throughout the animations.
const SECONDARY_COLOR = 'red';

export default class SortingVisualizer extends React.Component {
  setup = (p5, parentRef) => {
						p5.createCanvas(200, 200).parent(parentRef);
					};
  draw = p5 => {
						p5.background(0);
						p5.fill(255, this.y * 1.3, 0);
						p5.ellipse(p5.width / 2, this.y, 50);
						if (this.y > p5.height) this.direction = '';
						if (this.y < 0) {
							this.direction = '^';
						}
						if (this.direction === '^') this.y += 8;
						else this.y -= 4;
					};
  constructor(props) {
    super(props);

    this.state = {
      array: [],
    };
  }

  componentDidMount() {
    this.resetArray();
  }

  resetArray() {
    const array = [];
    for (let i = 0; i < NUMBER_OF_ARRAY_BARS; i++) {
      array.push(randomIntFromInterval(5, 730));
    }
    this.setState({array});
  }

  mergeSort() {
    const animations = getMergeSortAnimations(this.state.array);
    for (let i = 0; i < animations.length; i++) {
      const arrayBars = document.getElementsByClassName('array-bar');
      const isColorChange = i % 3 !== 2;
      if (isColorChange) {
        const [barOneIdx, barTwoIdx] = animations[i];
        const barOneStyle = arrayBars[barOneIdx].style;
        const barTwoStyle = arrayBars[barTwoIdx].style;
        const color = i % 3 === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;
        setTimeout(() => {
          barOneStyle.backgroundColor = color;
          barTwoStyle.backgroundColor = color;
        }, i * ANIMATION_SPEED_MS);
      } else {
        setTimeout(() => {
          const [barOneIdx, newHeight] = animations[i];
          const barOneStyle = arrayBars[barOneIdx].style;
          barOneStyle.height = `${newHeight}px`;
        }, i * ANIMATION_SPEED_MS);
      }
    }
  }

  quickSort() {
    // We leave it as an exercise to the viewer of this code to implement this method.
  }

  heapSort() {
    // We leave it as an exercise to the viewer of this code to implement this method.
  }

  bubbleSort() {
    // We leave it as an exercise to the viewer of this code to implement this method.
  }

  // NOTE: This method will only work if your sorting algorithms actually return
  // the sorted arrays; if they return the animations (as they currently do), then
  // this method will be broken.
  testSortingAlgorithms() {
    for (let i = 0; i < 100; i++) {
      const array = [];
      const length = randomIntFromInterval(1, 1000);
      for (let i = 0; i < length; i++) {
        array.push(randomIntFromInterval(-1000, 1000));
      }
      const javaScriptSortedArray = array.slice().sort((a, b) => a - b);
      const mergeSortedArray = getMergeSortAnimations(array.slice());
      console.log(arraysAreEqual(javaScriptSortedArray, mergeSortedArray));
    }
  }
  render() {
    function swap(arr, a, b) {
      let temp = arr[a];
      arr[a] = arr[b];
      arr[b] = temp;
    }
    const {array} = this.state;
    let values = [];

    let i = 0;
    let j = 0;
    let fat = 7.5;
    return (
      <div className="array-container">
        <Sketch
					setup={(p5, parentRef) => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
            values = new Array(Math.floor(p5.width / fat));
            for (let i = 0; i < values.length; i++) {
              values[i] = p5.random(p5.height);
              //values[i] = noise(i/100.0)*height;
            }
					}}
					draw={p5 => {
            p5.background(0);
            if (i < values.length) {
              for (let j = 0; j < (values.length) - i - 1; j++) {
                let a = values[j];
                let b = values[j + 1];
                if (a > b) {
                  swap(values, j, j + 1);
                }
              }
            } else {
              console.log("finished");
              p5.noLoop();
            }

            //we're on the jth rectangle
            for (let j = 0; j < values.length; j++) {
              if (j == values.length - i)
              {
                p5.fill('red');
              }
              else if (j > values.length - i - 1)
              {
                p5.fill('green');
              }
              else {
                p5.fill('white');
              }
              p5.rect(fat * j, p5.height - values[j], fat, values[j]);
            }
            i++;
					}}
				/>
      </div>
    );
  }
}

// From https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function arraysAreEqual(arrayOne, arrayTwo) {
  if (arrayOne.length !== arrayTwo.length) return false;
  for (let i = 0; i < arrayOne.length; i++) {
    if (arrayOne[i] !== arrayTwo[i]) {
      return false;
    }
  }
  return true;
}
