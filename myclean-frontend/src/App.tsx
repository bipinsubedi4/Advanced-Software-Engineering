import Header from "./components/Header";
import ServiceList from "./components/ServiceList";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <Header />
      <main style={{ maxWidth:880, margin:"0 auto", padding:"0 20px 40px" }}>
        <h2>Available Services</h2>
        <ServiceList />
      </main>
    </div>
  );
}
