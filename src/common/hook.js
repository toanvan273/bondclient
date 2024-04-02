import { useCallback, useEffect, useRef, useState } from "react";


export function useStateCallback(initialState) {
  const [state, setState] = useState(initialState)
  const cbRef = useRef(0)

  const setStateCallback = useCallback((state, cb) => {
    cbRef.current = cb;
    setState(state)
  }, [])
  
  useEffect(() => {
    if (cbRef.current) {
      cbRef.current(state)
      cbRef.current = null
    }
  },[state])

  return [state, setStateCallback]
}