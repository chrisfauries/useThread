import React, { useState, useEffect, useRef } from 'react';

const createWorker = <T extends (...args: any) => any>(cb: T) => {
   const fn = (cb: T) => {
       // eslint-disable-next-line no-restricted-globals
        self.onmessage = (message: {data: Parameters<T>}) => {
            const result = cb(...message.data);
            // eslint-disable-next-line no-restricted-globals
            self.postMessage(result);
        };
    };

    const blob = new Blob([`(${fn.toString()})(${cb.toString()})`]);
    const url = URL.createObjectURL(blob);
    return {instance : new Worker(url), url};
};

interface UseThreadState<T> {
    data: T | null,
    isRunning: boolean,
    error: ErrorEvent | null
}

 const useThread = <T extends (...args: any) => any>(cb: T) => {
    const [{data, isRunning, error}, _setState] = useState<UseThreadState<ReturnType<T>>>({data: null, isRunning: false, error: null});
    const worker = useRef<null | Worker>(null);
    const _url = useRef<null | string>(null);

    const run = (...args: Parameters<T>) => new Promise<ReturnType<T>>((res, rej) => {
        _setState((state) => ({...state, isRunning: true}));

        // create a new worker on the first run only
        if (worker.current === null) {
            const {instance, url} = createWorker(cb);
            worker.current = instance;
            _url.current = url;
        }

        worker.current.onmessage = ({data}) => {
            _setState({data, isRunning: false, error: null});
            res(data);
        }
        
        worker.current.onerror = (error) => {
            _setState({data: null, isRunning: false, error});
            rej(error);
        }
            

        worker.current.postMessage(args);      
     });

    useEffect(() => {
        return () => {
            if(worker.current) {
                worker.current.terminate();
            }

            if(_url.current) {
                URL.revokeObjectURL(_url.current);
            }
        }
    }, []);

     return {run, isRunning, data, error };
 }

 export default useThread;