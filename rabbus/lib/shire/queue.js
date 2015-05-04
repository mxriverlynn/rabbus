function Queue(values){
  this._values = values || [];
}

Object.defineProperty(Queue.prototype, "next", {
  get: function(){
    return this._values.shift();
  }
});

Object.defineProperty(Queue.prototype, "peek", {
  get: function(){
    return this._values[0];
  }
});

Queue.prototype.add = function(value){
  return this._values.push(value);
};

Queue.prototype.clone = function(){
  var values = [].concat(this._values);
  return new Queue(values);
};

module.exports = Queue;
