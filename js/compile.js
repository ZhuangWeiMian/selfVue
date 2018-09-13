// 编译的过程，首先将所有子节点添加上去，然后判断节点类型，再判断节点属性
// 节点属性分为 v-model 和 v-on 事件，对于v-on对相应节点添加监听事件
function Compile(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.fragment = null;
    this.init();
}
Compile.prototype = {
    init: function() {
        if (!this.el) {
            console.log("请先挂载到某个特定节点上");
            return
        } else {
            // 首先将所有的模板初始化上去，所有的子节点
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment)
            this.el.appendChild(this.fragment)
        }
    },
    nodeToFragment: function(el) {
        // 创建一个新的空白的文档片段
        // 因为文档片段存在于内存中，并不在DOM树中
        // 所以将子元素插入到文档片段时不会引起页面回流（对元素位置和几何上的计算）。
        // 因此，使用文档片段通常会带来更好的性能。
        let fragment = document.createDocumentFragment();
        let child = el.firstChild;
        while (child) {
            fragment.appendChild(child);
            child = el.firstChild
        }
        return fragment;
    },
    compileElement: function(el) {
        let childNodes = el.childNodes;
        childNodes.forEach(node => {
            let reg = /\{\{(.*)\}\}/;
            let text = node.textContent;
            // 首先判断节点的属性
            if (this.isElementNode(node)) {
                this.compile(node);
            } else if (this.isTextNode(node)) {
                if(reg.exec(text)) {
                    this.compileText(node, reg.exec(text)[1]);
                }
            }
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node)
            }
        });
    },
    compile: function(node) {
        let nodeAttrs = [...node.attributes];
        nodeAttrs.forEach((attr) => {
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
                let exp = attr.value;
                let dir = attrName.substring(2);
                // 除去指令中的空格
                dir = dir.replace(/\s+/g,"");
                if (this.isEventDirective(dir)) {  // 事件指令
                    this.compileEvent(node, this.vm, exp, dir);
                } else {  // v-model 指令
                    this.compileModel(node, this.vm, exp, dir);
                }
            }
        })
    },
    compileEvent: function(node, vm, exp, dir)  {
        let eventType = dir.split(':')[1];
        let cb = vm.method && vm.method[exp];
        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    },
    compileText: function(node, exp) {
        let initText = this.vm[exp];
        this.updateText(node, initText);
        new Watcher(this.vm, exp, (value) => {
            this.updateText(node, value)
        });
    },
    compileModel: function(node, vm, exp, dir) {
        let value = this.vm[exp];
        this.modelUpdate(node, value);
        new Watcher(this.vm, exp, (value) => {
            this.modelUpdate(node, value)
        });
        // 这里的事件因为不用写在页面中的method里，所以需要在内部进行监听
        node.addEventListener('input', (e) => {
            let newValue = e.target.value;
            if (value === newValue) {return}
            this.vm[exp] = newValue;
            value = newValue;
        })
    },
    updateText: function(node, value) {
        node.textContent = typeof value == 'undefined' ? '': value;
    },
    modelUpdate: function(node, value, oldValue) {
        // input节点的值
        node.value = typeof value === 'undefined' ? '': value;
    },
    isDirective: function(attr) {
        return attr.indexOf('v-') === 0;
    },
    isEventDirective: function(dir) {
        return dir.indexOf('on:') === 0;
    },
    isElementNode: function(node) {
        return node.nodeType === 1;
    },
    isTextNode: function(node) {
        return node.nodeType === 3;
    }
}