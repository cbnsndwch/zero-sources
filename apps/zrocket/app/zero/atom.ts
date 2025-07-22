// eslint-disable-next-line no-unused-vars
type AtomCallback<T> = (value: T | undefined) => void;

export class Atom<T> {
    #subs = new Set<AtomCallback<T>>();
    #val: T | undefined;

    set current(value: T | undefined) {
        this.#val = value;
        this.#subs.forEach(listener => listener(value));
    }

    get current() {
        return this.#val;
    }

    onChange = (cb: AtomCallback<T>) => {
        this.#subs.add(cb);

        cb(this.#val);

        return () => this.#subs.delete(cb);
    };
}
