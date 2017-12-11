function NeuralNetworkException(message)
{
    this.message = message;
    this.name = "NeuralNetworkException";
}

function Network(topology)
{
    this.min = -1.0;
    this.max = 1.0;

    this.topology = topology;
    
    this.InputLayer = 0;
    this.OutputLayer = topology.length -1;
    //counts
    this.WeightCount = 0;
    this.NeuronCount = 0;
    this.LayerCount = this.topology.length;
    this.InputCount = topology[0];
    this.OutputCount = topology[this.OutputLayer];

    //weights[Layer][Node][Weight]
    this.weights = [];
    for (var i = 0; i < topology.length - 1; i++)
    {
        this.weights[i] = [];

        for (var j = 0; j < topology[i]; j++)
        {
            var nLC = (i == (topology.length - 2)) ? topology[i + 1] : topology[i + 1] - 1; //NextLayerCount
            this.weights[i][j] = [];

            for(var k=0;k<nLC;k++){
                this.weights[i][j][k] = 0.0;
            }

            this.WeightCount += this.weights[i][j].length;
        }
    }

    //values[Layer][Node]
    this.values = [];
    for (var i = 0; i < topology.length; i++)
    {
        var numNodes = topology[i];
        this.values[i] = [];

        for(var j=0;j<numNodes;j++){
            this.values[i][j] = 0.0;
        }

        this.values[i][numNodes - 1] = i == topology.Count - 1 ? 0.0 : 1.0;
        this.topology[i] = numNodes;

        this.NeuronCount += numNodes;
    }
}

Network.prototype.randomWeight = function()
{
    return (this.max - this.min) * Math.random() + this.min;
}

Network.prototype.setRandomWeights = function(){
    var w = [];

    for(var i=0;i<this.WeightCount;i++){
        w[i] = this.randomWeight();
    }

    this.setWeights(w);
}

Network.prototype.Process = function(inputs){
    var lCount = this.topology.length;

    //Check the input layer size
    if(inputs.length != this.values[0].length){
        console.log("Input node count mismatch (" + inputs.length + ", expected " + this.values[0].length + ")", "inputs")
        return 0;
    }

    //Set initial values
    for (var i = 0; i < inputs.length; i++)
    {
        this.values[0][i] = inputs[i];
    }

    //Process Layers
    for (var cLayer = 1; cLayer < lCount; cLayer++)
    {
        var prevLayerLength = this.topology[cLayer - 1];
        var currLayerLength = cLayer < lCount - 1 ? this.topology[cLayer] - 1 : this.topology[cLayer];

        for (var cNode = 0; cNode < currLayerLength; cNode++)
        {
            var sum = 0.0;
            for (var cNodePrev = 0; cNodePrev < prevLayerLength; cNodePrev++)
            {
                sum += this.values[cLayer - 1][cNodePrev] * this.weights[cLayer - 1][cNodePrev][cNode];
            }

            this.values[cLayer][cNode] = Math.tanh(sum);
        }
    }

    return this.getOutputs();
}

Network.prototype.GetError = function(inputs, outputs)
{
    var error = 0.0;

    if(inputs.length != outputs.length)
        throw new NeuralNetworkException("Number of input cases mismatches number of output cases " + inputs.length + "/" + outputs.length);

    for(var i=0; i<inputs.length; i++){
        var o = this.Process(inputs[i]);

        if(o.length != outputs[i].length)
            throw new NeuralNetworkException("Number of output nodesmismatch " + o.length + "/" + outputs[i].length);

        for(var j=0; j<o.length; j++){
            error += Math.abs(outputs[i][j] - o[j]);
        }
    }

    return error;
}

Network.prototype.setWeights = function(w)
{
    if (w.Length > this.WeightCount)
    {
        throw new NeuralNetworkException("Too many input weights (" + w.Length + ", expected " + this.WeightCount + ")", "w");
    }
    else if (w.Length < this.WeightCount)
    {
        throw new NeuralNetworkException("Too few input weights (" + w.Length + ", expected " + this.WeightCount + ")", "w");
    }
    else
    {
        var c = 0;
        //Synchronous
        for (var i = 0; i < this.weights.length; i++)
        {
            for (var j = 0; j < this.weights[i].length; j++)
            {
                for (var k = 0; k < this.weights[i][j].length; k++)
                {
                    this.weights[i][j][k] = w[c];
                    c++;
                }
            }
        }
    }
}

Network.prototype.getWeights = function()
{
    var w = [];
    var c = 0;
    //Synchronous
    for (var i = 0; i < this.weights.length; i++)
    {
        for (var j = 0; j < this.weights[i].length; j++)
        {
            for (var k = 0; k < this.weights[i][j].length; k++)
            {
                w[c] = this.weights[i][j][k];
                c++;
            }
        }
    }

    return w;
}

Network.prototype.getOutputs = function()
{
    var outputs = [];
    var n = this.values[this.values.length - 1].length;

    for(var i=0;i<n;i++){
        outputs[i] = this.values[this.values.length - 1][i];
    }

    return outputs;
}

Network.prototype.draw = function(canvas){
    if(canvas == null)
        return;

    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var maxNodes = 0;

    for(var i=0;i<this.topology.length;i++){
        maxNodes = this.topology[i] > maxNodes ? this.topology[i] : maxNodes;
    }

    var xBorder = 0;
    var yBorder = 15;

    var diameter = canvas.height / (maxNodes + 1) - yBorder;

    var xStep = canvas.width / (this.values.length + 1) - xBorder;

    var coordinates = [];

    //Neurons
    ctx.font = "10px Arial";
    for(var i=0;i<this.values.length;i++){

        coordinates[i] = [];

        var yStep = canvas.height / (this.values[i].length + 1);

        for(var j=0;j<this.values[i].length;j++){
            var x = xStep * (i + 1);
            var y = yStep * (j + 1);
            var r = diameter/2;

            ctx.beginPath();
            ctx.arc(x,y,r,0,2*Math.PI);
            ctx.stroke();

            coordinates[i][j] =  {x,y};

            ctx.fillText(this.values[i][j].toFixed(2), x - diameter/2, y - diameter / 2 - 5);
        }
    }

    //Weights
    ctx.font = "10px Arial";
    for(var i=0;i<this.weights.length;i++){
        for(var j=0;j<this.weights[i].length;j++){
            for(var k=0;k<this.weights[i][j].length;k++){

                var s = coordinates[i][j];
                var g = coordinates[i+1][k];

                ctx.moveTo(s.x,s.y);
                ctx.lineTo(g.x,g.y);
                ctx.stroke();

                //ctx.fillText(this.weights[i][j][k].toFixed(2), (g.x + s.x)/2, (g.y + s.y)/2 + 10);
            }
        }
    }
}


/* Neural Back Propagation */
function NetworkBackProp(topology){
    Network.apply(this,[topology]);

    this.RecentAvgError = 0.0;
    this.RecentAvgSmoothingFactor = 100.0;
    this.eta = 0.15;
    this.alpha = 0.5;

    this.InitBackProp();
}

NetworkBackProp.prototype = Object.create(Network.prototype);

NetworkBackProp.prototype.InitBackProp = function(){

    //Gradients
    this.gradients = [];
    for (var i = 0; i < this.LayerCount; i++)
    {
        var numNodes = i > 0 && i < this.LayerCount - 1 ? this.topology[i] - 1 : this.topology[i];
        this.gradients[i] = [];

        for(var j=0;j<numNodes;j++){
            this.gradients[i][j] = 0.0;
        }
    }

    //Delta Weights
    this.deltaWeights = [];
    for (var i = 0; i < this.LayerCount - 1; i++)
    {
        this.deltaWeights[i] = [];

        for (var j = 0; j < this.gradients[i].length; j++)
        {
            var nLC = (i == (this.LayerCount - 2)) ? this.topology[i + 1] : this.topology[i + 1] - 1; //NextLayerCount
            this.deltaWeights[i][j] = [];

            for(var k=0;k<nLC;k++){
                this.deltaWeights[i][j][k] = 0.0;
            }
        }
    }

    //Random Weights
    this.setRandomWeights();
}

NetworkBackProp.prototype.BackPropCases = function(cases){
    for(var i=0;i<cases.length;i++){
        this.BackProp(cases[i][0],cases[i][1]);
    }

    return this.RecentAvgError;
}

NetworkBackProp.prototype.BackPropBatch = function (inputs, targets){
    for(var i=0;i<inputs.length;i++){
        this.BackProp(inputs[i],targets[i]);
    }

    return this.RecentAvgError;
}

NetworkBackProp.prototype.BackProp = function (inputs, targets){
    var outLayer = this.topology.length - 1;
    var error = 0.0;

    var o = this.Process(inputs);

    // Calculate overall net error (RMS of output errors)
    for(var i=0;i<this.OutputCount;i++){
        var delta = targets[i] - o[i];
        error += delta * delta;
    }

    error /= this.OutputCount; //Get average error squared
    error = Math.sqrt(error); //RMS

    //Implement a recent average measurement :
    this.RecentAvgError = (this.RecentAvgError * this.RecentAvgSmoothingFactor + error) / (this.RecentAvgSmoothingFactor + 1.0);

    //Calculate output layer gradients
    for (var n = 0; n < this.OutputCount; n++)
    {
        this.gradients[outLayer][n] = this.CalcOutGradient(targets[n], this.values[outLayer][n]);
    }

    //Calculate on hidden layers
    for (var Layer = this.LayerCount - 2; Layer > 0; --Layer)
    {
        var LayerNext = Layer+1;

        for (var n = 0; n < this.topology[Layer]-1; ++n)
        {
            this.gradients[Layer][n] = this.CalcGradient(this.values[Layer][n], this.weights[Layer][n], this.gradients[LayerNext]);
        }
    }

    // For all layers from output to first hidden layer,
    // update connection weights

    for (var Layer = this.LayerCount - 1; Layer > 0; --Layer)
    {
        var LayerPrev = Layer - 1;
        var LayerLength = Layer >= 1 && Layer < this.LayerCount - 1 ? this.topology[Layer] - 1 : this.topology[Layer];
        var PrevLayerLength = LayerPrev >= 1 && LayerPrev < this.LayerCount - 1 ? this.topology[LayerPrev] - 1 : this.topology[LayerPrev];

        for (var n = 0; n < LayerLength; n++)
        {
            for(var m = 0; m < PrevLayerLength; m++)
            {
                var d = this.deltaWeights[LayerPrev][m][n];
                this.deltaWeights[LayerPrev][m][n] =
                    //Individual input, magnified by the gradient and train rate
                    this.eta
                    * this.values[LayerPrev][m]
                    * this.gradients[Layer][n]
                    //Also add momentum = a fraction of the previous delta weight
                    + this.alpha
                    * d;
                this.weights[LayerPrev][m][n] += this.deltaWeights[LayerPrev][m][n];
            }
        }
    }
}

NetworkBackProp.prototype.CalcOutGradient = function(target, output){
    var delta = target - output;
    return delta * this.TransferFunctionDerivative(output);
}

NetworkBackProp.prototype.CalcGradient = function(value, NeuronWeights, NextLayerGradients){
    var dow = this.SumDOW(NeuronWeights, NextLayerGradients);
    return dow * this.TransferFunctionDerivative(value);
}

NetworkBackProp.prototype.TransferFunctionDerivative = function(x){
    return 1.0 - x * x;
}

NetworkBackProp.prototype.SumDOW = function(NeuronWeights, NextLayerGradients){
    var sum = 0.0;

    //Sum our contributions of the errors at the nodes we feed

    for (var n = 0; n < NextLayerGradients.length; n++)
    {
        sum += NeuronWeights[n] * NextLayerGradients[n];
    }

    return sum;
}