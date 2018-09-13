function SelfVue(options) {
    this.data = options.data
    this.method = options.methods;
    // 作为代理，原本的数据读取为 this.data.xxx 转为 this.xxx
    Object.keys(this.data).forEach((key) => {
        this.proxyKey(key)
    })
    
    // 数据双向绑定
    observe(this.data)
    // 模板编译
    new Compile(options.el, this)
    options.mounted.call(this)
}

SelfVue.prototype.proxyKey = function (key) {
    Object.defineProperty(this, key, {
        enumerable: false,
        configurable: true,
        get: function getter() {
            return this.data[key]
        },
        set: function setter(val) {
            this.data[key] = val
        }
    })
}