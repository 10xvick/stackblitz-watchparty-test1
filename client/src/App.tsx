import { useEffect, useState } from "react";
import {endpoints} from "../../global/constants/endpoints"

import './index.css'
import { io } from "socket.io-client";
const api = endpoints.server;
const socket = io(endpoints.server.url);
socket.connect();

function App() {
  const data = fetchData(api.url)
  console.log(123,api)


  return (
    <> x x x a
    
    ayz d {data}
    </>
  )
}

export default App

function fetchData(url:string){
  const [data,setData] = useState(null);
  useEffect(()=>{
    fetch(url+'/todo/list').then(e=>e.text()).then(e=>{
      setData(e)
    }).catch(e=>console.error(e))
  },[]);
  
  return data; 
}
