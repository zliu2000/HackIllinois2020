import React from 'react';
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
/*
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
*/
  method = 0;
  quickSort() {
    // We leave it as an exercise to the viewer of this code to implement this method.
  }

  heapSort() {
    // We leave it as an exercise to the viewer of this code to implement this method.
  }

  bubbleSort() {
    this.method = 4;
    this.reload();
  }
  bubbleDraw() {
    // We leave it as an exercise to the viewer of this code to implement this method.
    let values = [];

    let i = 0;
    let j = 0;
    let bubble_draw = p5 => {
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
    };
    function swap(arr, a, b) {
      let temp = arr[a];
      arr[a] = arr[b];
      arr[b] = temp;
    }
    let fat = 7.5;
    return (
        <Sketch
					setup={(p5, parentRef) => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
            values = new Array(Math.floor(p5.width / fat * 0.75));
            for (let i = 0; i < values.length; i++) {
              values[i] = p5.random(p5.height);
              //values[i] = noise(i/100.0)*height;
            }
					}}
					draw={bubble_draw}
				/>
    );
  }
/*
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
*/
  reload(){
    var container = document.getElementById("myDiv");
    var content = container.innerHTML;
    container.innerHTML= content;
  }
  //runs sorting method vis. based on method id
  //0 for not chosen
  //3 for bubblesort
  runMethod() {
    if (this.method == 0)
    {
      return ("Choose a sorting method!");
    }
    if (this.method == 4)
    {
      return this.bubbleDraw();
    }
    return ("Whoops!");

  }


  render() {
    //https://stackoverflow.com/questions/10841239/enabling-refreshing-for-specific-html-elements-only
    return (
      <div className="array-container" id = "myDiv">
        <button onClick={() => this.resetArray()}>Generate New Array</button>
          <button onClick={() => this.mergeSort()}>Merge Sort</button>
          <button onClick={() => this.quickSort()}>Quick Sort</button>
          <button onClick={() => this.heapSort()}>Heap Sort</button>
          <button onClick={() => this.bubbleSort()}>Bubble Sort</button>
          <button onClick={() => this.testSortingAlgorithms()}>
            Test Sorting Algorithms (BROKEN)
          </button>
          {() => this.runMethod()}
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
