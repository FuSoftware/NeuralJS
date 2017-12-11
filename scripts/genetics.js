function Individual(numGenes, minGene, maxGene, mutateRate, mutateChange){
    this.numGenes = numGenes;
    this.minGene = minGene;
    this.maxGene = maxGene;
    this.mutateRate = mutateRate;
    this.mutateChange = mutateChange;
    this.chromosome = [];
    this.fitness = 0.0;

    for (var i = 0; i < numGenes; ++i)
            this.chromosome[i] = (maxGene - minGene) * Math.random() + minGene;
}

function compareIndividualsDec(a,b)
{
    if (a.fitness > b.fitness) return 1;
    else if (a.fitness < b.fitness) return -1;
    else return 0
}

function compareIndividualsInc(a,b){
    if (a.fitness > b.fitness) return -1;
    else if (a.fitness < b.fitness) return 1;
    else return 0
}

function Population(numGenes, popSize, minGene, maxGene, mutateRate, mutateChange, tau, maxGeneration)
{
    this.numGenes = numGenes;
    this.popSize = popSize;
    this.minGene = minGene;
    this.maxGene = maxGene;
    this.mutateRate = mutateRate;
    this.mutateChange = mutateChange;
    this.tau = tau;
    this.maxGeneration = maxGeneration;

    this.done = false;
    this.gen = 0;

    this.population = []
    this.bestSolution = [];
    this.bestFitness = -Number.MAX_VALUE;

    for(var i=0;i<popSize;i++){
        this.population[i] = this.newIndividual();
    }

    this.sortFunction = compareIndividualsInc;
}

Population.prototype.GetBestIndividual = function(){
    this.population.sort(this.sortFunction);
    return this.population[0];
}

Population.prototype.NextGeneration = function(){
    if (!this.isGenLimitReached() && !this.isDone())
    {
        this.population.sort(this.sortFunction);

        for (var i = 0; i < this.popSize; ++i)
        {
            if (this.population[i].fitness > this.bestFitness)
            {
                this.bestFitness = this.population[i].fitness;
                this.bestSolution = this.population[i].chromosome;
            }
        }

        var parents = this.Select(2);
        var children = this.Reproduce(parents);
        this.Place(children);
        this.Immigrate(this.newIndividual());
        this.gen++;
    }
}

Population.prototype.isDone = function(){
    return this.done;
}

Population.prototype.isGenLimitReached = function(){
    return (this.gen >= this.maxGeneration);
}

Population.prototype.getBestGenome = function(){
    return this.bestSolution;
}

Population.prototype.Select = function(n){
    var indexes = [];

    for(var i=0;i<this.popSize;i++)
        indexes[i] = i;

    for(var i=0;i<this.popSize;i++){
        var r = parseInt(Math.random() * this.popSize,10);
        var tmp = indexes[r];
        indexes[r] = indexes[i]
        indexes[i] = tmp;
    }

    var tournSize = parseInt(this.tau*this.popSize,10);
    if (tournSize < n) tournSize = n;

    var candidates = [];

    for (var i = 0; i < tournSize; ++i)
        candidates[i] = this.population[indexes[i]];

    candidates.sort(this.sortFunction);

    var results = [];
    for (var i = 0; i < n; ++i)
        results[i] = candidates[i];

    return results;
}

Population.prototype.newIndividual = function(){
    //console.log("New Individual");
    return new Individual(this.numGenes, this.minGene, this.maxGene, this.mutateRate, this.mutateChange)
}

Population.prototype.Reproduce = function(parents){
    this.numGenes;
    var cross = parseInt(Math.random() * this.numGenes,10);

    var children = [];

    children[0] = this.newIndividual();
    children[1] = this.newIndividual();

    for(var i=0;i<2;i++){
        for(var j=0;j <= cross; j++){
            children[i].chromosome[j] = parents[0].chromosome[j];
        }

        for(var j=cross+1; j < this.numGenes; j++){
            children[i].chromosome[j] = parents[1].chromosome[j];
        }

        this.Mutate(children[i]);
    }

    return children;
}

Population.prototype.Mutate = function(child)
{
    /*
    The method walks through a chromosome. 
    A random value is generated. 
    If this value is less than the mutateRate, the current gene is mutated. 
    Suppose that mutateChange = 0.01 and maxGene = 10.0 as in the demo. Their product is 0.01 * 10.0 = 0.10. Then a random delta between -0.10 and +0.10 is added to the current gene. 
    So, larger values of mutateChange will generate larger changes when Mutate is called, which in turn will cause the EO algorithm to converge to a solution more quickly, at the expense of an increased risk of overshooting an optimal solution.
    */

    var hi = this.mutateChange * this.maxGene;
    var lo = -hi;
    for (var i = 0; i < child.chromosome.length; ++i)
    {
        if (Math.random() < this.mutateRate)
        {
            var delta = (hi - lo) * Math.random() + lo;
            child.chromosome[i] += delta;
        }
    }
}

Population.prototype.Place = function(children)
{
    this.population[this.popSize - 1] = children[0];
    this.population[this.popSize - 2] = children[1];
}

Population.prototype.Immigrate = function(immigrant)
{
    this.population[this.popSize - 3] = immigrant;
}