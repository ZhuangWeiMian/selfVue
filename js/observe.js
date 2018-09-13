// 遍历对象的所有属性，进行双向绑定
function Observe(data) {
    this.data = data;
    Object.keys(this.data).forEach((key) => {
        this.definReactive(this.data, key, this.data[key])
    })
}
Observe.prototype.definReactive = function(obj, key, val) {
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function getter() {
                if (Dep.target) {
                    // Watcher对象存在全局的Dep.target中
                    dep.addSub(Dep.target);
                }
                return val
            },
            set: function(newVal) {
                if (newVal === val) return
                val = newVal;
                dep.notify();
            }
        })
}
// 依赖收集存储地方
function Dep() {
    this.subs = [];
}
Dep.prototype.notify = function() {
    this.subs.forEach((sub) => {
        sub.update()
    })
}
Dep.prototype.addSub = function(sub) {
    this.subs.push(sub)
}
Dep.target = null;
function observe(value) {
    return new Observe(value)
}