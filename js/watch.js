function Watcher(vm, exp, cb) {
    this.cb = cb;
    this.vm = vm;
    this.exp = exp;
    this.value = this.get();
}
Watcher.prototype = {
    update: function() {
        let value = this.vm.data[this.exp];
        let oldValue = this.value;
        if (value !== oldValue) {
            this.value = value;
            this.cb.call(this.vm, value, oldValue);
        }
    },
    get: function() {
        // 这里将观察者本身赋值给全局的target，只有被target标记过的才会进行依赖收集
        Dep.target = this
        let value = this.vm.data[this.exp];
        return value;
    }
}