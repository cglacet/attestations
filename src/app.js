import server from 'server';
const { get, post } = server.router;


export default function App(options, initialRoutes = []){
    const routes = [...initialRoutes]
    return {
        get: (...args) => routes.push(get(...args)),
        set: (...args) => routes.push(set(...args)),
        server: server(options, routes),
    }
}