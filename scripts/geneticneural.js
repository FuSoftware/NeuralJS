function NeuralIndividual(topology, mutateRate, mutateChange){
    this.network = new Network(topology);

    Individual.apply(this,[this.network.WeightCount,this.network.min,this.network.max,mutateRate,mutateChange]);

    this.CommitChromosome();
}

NeuralIndividual.prototype = Object.create(Individual.prototype);

NeuralIndividual.prototype.CommitChromosome = function(){
    this.network.setWeights(this.chromosome);
}

NeuralIndividual.prototype.Process = function(inputs){
    return this.network.Process(inputs);
}

NeuralIndividual.prototype.ProcessFitness = function(inputs, outputs){
    this.fitness = -this.network.GetError(inputs,outputs);
}

function NeuralPopulation(topology, popSize, mutateRate, mutateChange, tau, maxGeneration){
    var n = new Network(topology);
    this.topology = topology;

    Population.apply(this,[n.WeightCount,popSize,-1.0,1.0,mutateRate, mutateChange, tau, maxGeneration]);
}

NeuralPopulation.prototype = Object.create(Population.prototype);

NeuralPopulation.prototype.ProcessGeneration = function(inputs,outputs){
    for(var i=0;i<this.popSize;i++){
        this.population[i].ProcessFitness(inputs,outputs);
    }

    this.NextGeneration();
}

NeuralPopulation.prototype.newIndividual = function(){
    //console.log("New NeuralIndividual");
    return new NeuralIndividual(this.topology, this.mutateRate, this.mutateChange);
}

function GeneticProcessor(topology, popSize, maxGen, inputs, outputs)
{
    this.topology = topology;
    this.popSize = popSize;
    this.maxGen = maxGen;
    this.population = new NeuralPopulation(topology,popSize,0.25,0.1,0.4,maxGen);
    this.inputs = inputs;
    this.outputs = outputs;
}

GeneticProcessor.prototype.Process = function(){
    var c = 0;
    while(!this.population.isGenLimitReached()){
        this.ProcessGeneration();
        
        if(c % 10 == 0)
            console.log("Fitness : " + this.population.bestFitness + " for generation " + this.population.gen);
        c++;
    }
}

GeneticProcessor.prototype.ProcessGeneration = function(){
    this.population.ProcessGeneration(this.inputs,this.outputs);
}