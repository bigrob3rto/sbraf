import { Injectable, OnInit } from '@angular/core';

// tensorflow import
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

// var tf;
// var tfvis;

@Injectable({
  providedIn: 'root'
})

export class NeuralService  {
  title = 'nn';
  public trainData = [];
  public model;
  public normalizationData;


  constructor() { }

  private createModel() {
    // Create a sequential model
    const model = tf.sequential();

    // Add a single input layer
    model.add(tf.layers.dense({ inputShape: [3], units: 3, useBias: true }));
    // hidden layer
    model.add(tf.layers.dense({ units: 50, activation: 'relu' }));
    // model.add(tf.layers.dense({ units: 5, activation: 'relu' }));

    // Add an output layer
    model.add(tf.layers.dense({ units: 1, useBias: true }));

    return model;
  }

  /**
   * Convert the input data to tensors that we can use for machine 
   * learning. We will also do the important best practices of _shuffling_
   * the data and _normalizing_ the data
   * MPG on the y-axis.
   */
  convertToTensor(data) {
    // Wrapping these calculations in a tidy will dispose any 
    // intermediate tensors.

    return tf.tidy(() => {
      // Step 1. Shuffle the data    
      tf.util.shuffle(data);

      // Step 2. Convert data to Tensor
      // const inputs = data.map(d => d.wei);
      const inputs = data.map(d => [d.price, d.weekday, d.foodcost]);
      const labels = data.map(d => d.revenue);

      const inputTensor = tf.tensor2d(inputs, [inputs.length, 3]);
      const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

      //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
      const inputMax = inputTensor.max(0);  // get max on axes 0
      // tf.print(inputMax);
      const inputMin = inputTensor.min(0);  // get max on axes 0
      // tf.print(inputMin);
      const labelMax = labelTensor.max();
      const labelMin = labelTensor.min();

      const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
      const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

      this.normalizationData = {
        inputs: normalizedInputs,
        labels: normalizedLabels,
        // Return the min/max bounds so we can use them later.
        inputMax,
        inputMin,
        labelMax,
        labelMin,
      }
      
      return this.normalizationData;
    });
  }

  /**
 * Get the car data reduced to just the variables we are interested
 * and cleaned of missing data.
 */
  async getData() {
    // const carsDataResponse = await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json');
    // const carsData = await carsDataResponse.json();
    // const cleaned = carsData.map(car => ({
    //   mpg: car.Miles_per_Gallon,
    //   wei: car.Weight_in_lbs,
    //   horsepower: car.Horsepower,
    // }))
    //   .filter(car => (car.mpg != null && car.horsepower != null && car.wei != null));

    const cleaned = this.trainData.filter(row => (row.price != null && row.weekday != null
      && row.revenue != null && row.foodcost != null));
    return cleaned;
  }

  /***************************************************** */
  async run() {
    // create visor
    // const c1 = document.parentElement //getElementById("model");
    // Create a surface and specify its height
    tfvis.visor();

    // Load and plot the original input data that we are going to train on.
    const data = await this.getData();
    const v1 = data.map(d => ({
      x: d.price,
      y: d.revenue,
    }));

    let surface = { name: 'Revenue vs Price', tab: 'Data' };

    tfvis.render.scatterplot(
      surface,
      { values: v1 },
      {
        xLabel: 'Price',
        yLabel: 'Revenue',
        height: 220
      }
    );
    tfvis.visor().setActiveTab('Data');

    const v2 = data.map(d => ({
      x: d.weekday,
      y: d.revenue,
    }));

    surface = { name: 'Revenue vs Weekday', tab: 'Data' };
    tfvis.render.scatterplot(
      surface,
      { values: v2 },
      {
        xLabel: 'Weekday',
        yLabel: 'Revenue',
        height: 220
      }
    );

    const v3 = data.map(d => ({
      x: d.foodcost,
      y: d.revenue,
    }));

    surface = { name: 'Revenue vs Foodcost', tab: 'Data' };
    tfvis.render.scatterplot(
      surface,
      { values: v3 },
      {
        xLabel: 'Foodcost',
        yLabel: 'Revenue',
        height: 220
      }
    );

    // More code will be added below
    // Create the model
    this.model = this.createModel();
    // const c1 = document.getElementById("model");
    const surface1 = { name: 'Model Summary', tab: 'Model' };
    tfvis.show.modelSummary(surface1, this.model);
    // tfvis.visor().setActiveTab('Model');

    // Convert the data to a form we can use for training.
    const tensorData = this.convertToTensor(data);
    const { inputs, labels } = tensorData;

    // Train the model  
    await this.trainModel(this.model, inputs, labels);
    // console.log('Done Training');

    // Make some predictions using the model and compare them to the
    // original data
    this.testModel(this.model, data, tensorData);
  }


  public async trainModel(model, inputs, labels) {
    // Prepare the model for training.  
    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ['mse'],
    });

    const batchSize = 128;
    const epochs = 50;

    // tf.print( inputs);
    const surface = { name: 'Training', tab: 'Training' };
    // tfvis.visor().setActiveTab('Training');

    return await model.fit(inputs, labels, {
      batchSize,
      epochs,
      shuffle: true,
      callbacks: tfvis.show.fitCallbacks(
        surface,
        ['loss', 'mse'],
        { height: 220, callbacks: ['onEpochEnd'] }
      )
    });
  }

  public testModel(model, inputData, normalizationData) {
    const { inputMax, inputMin, labelMin, labelMax } = normalizationData;

    // Generate predictions for a uniform range of numbers between 0 and 1;
    // We un-normalize the data by doing the inverse of the min-max scaling 
    // that we did earlier.
    const [xs, preds] = tf.tidy(() => {

      const x1 = tf.linspace(0, 1, 100);
      const x2 = tf.linspace(0, 1, 100);
      const x3 = tf.linspace(0, 1, 100);
      const xs = x1.concat(x2).concat(x3).reshape([100, 3]);
      // console.log("Test data")
      // tf.print(testData);
      // const preds = model.predict(xs.reshape([100, 2]));

      // const xs = testData
      const preds = model.predict(xs);

      const unNormXs = xs
        .mul(inputMax.sub(inputMin))
        .add(inputMin);

      const unNormPreds = preds
        .mul(labelMax.sub(labelMin))
        .add(labelMin);

      // Un-normalize the data
      return [<any>unNormXs.arraySync(), <any>unNormPreds.dataSync()];
    });


    let predictedPoints = xs
      .map((val, i) => {
        return { x: val[1], y: preds[i] }
      });

    let originalPoints = inputData.map(d => ({
      x: d.weekday, y: d.revenue,
    }));


    let surface = { name: 'Revenue vs Weekday', tab: 'Prediction' };

    tfvis.render.scatterplot(
      surface,
      { values: [originalPoints, predictedPoints], series: ['original', 'predicted'] },
      {
        xLabel: 'Weekday',
        yLabel: 'Revenue',
        height: 220
      }
    );

    tfvis.visor().setActiveTab('Prediction');

    predictedPoints = xs
      .map((val, i) => {
        return { x: val[0], y: preds[i] }
      });

    originalPoints = inputData.map(d => ({
      x: d.price, y: d.revenue,
    }));

    surface = { name: 'Revenue vs Price', tab: 'Prediction' };
    tfvis.render.scatterplot(
      surface,
      { values: [originalPoints, predictedPoints], series: ['original', 'predicted'] },
      {
        xLabel: 'Price',
        yLabel: 'Revenue',
        height: 220
      }
    );

    predictedPoints = xs
      .map((val, i) => {
        return { x: val[2], y: preds[i] }
      });

    originalPoints = inputData.map(d => ({
      x: d.foodcost, y: d.revenue,
    }));

    surface = { name: 'Revenue vs Foodcost', tab: 'Prediction' };
    tfvis.render.scatterplot(
      surface,
      { values: [originalPoints, predictedPoints], series: ['original', 'predicted'] },
      {
        xLabel: 'Foodcost',
        yLabel: 'Revenue',
        height: 220
      }
    );

  }

  /*********************************************
   * Single point prediction
   */
  predict(inputs) : number {

    const preds = tf.tidy(() => {
      const { inputMax, inputMin, labelMin, labelMax } = this.normalizationData;

      const inputTensor = tf.tensor2d(inputs, [1,inputs.length]);
      const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));

      const preds = this.model.predict(normalizedInputs);

      const unNormXs = normalizedInputs
        .mul(inputMax.sub(inputMin))
        .add(inputMin);

      const unNormPreds = preds
        .mul(labelMax.sub(labelMin))
        .add(labelMin);

      // Un-normalize the data
      // return [<any>unNormXs.arraySync(), <any>unNormPreds.dataSync()];
      return Number(unNormPreds.dataSync()[0]);
      });

    return preds;
  }


  hide() {
    tfvis.visor().toggle();
  }


}