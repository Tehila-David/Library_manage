class DB {
    constructor(name) {
        this.name = name;
        this.data = JSON.parse(localStorage.getItem(name)) || [];
    }

    save() {
        localStorage.setItem(this.name, JSON.stringify(this.data));
    }

    getAll() {
        return this.data;
    }

    getById(id) {
        return this.data.find(item => item.id === id);
    }

    add(item) {
        item.id = Date.now().toString();
        this.data.push(item);
        this.save();
    }

    update(id, newData) {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            this.data[index] = { ...this.data[index], ...newData };
            this.save();
        }
    }

    delete(id) {
        this.data = this.data.filter(item => item.id !== id);
        this.save();
    }
}
