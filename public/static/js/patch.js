Map.prototype.map = function(func){
    return new Map(Array.from(this, ([k, v]) => func(k, v)));
}

Map.prototype.mapValues = function(func){
    return new Map(Array.from(this, ([k, v]) => [k, func(v)]));
}
