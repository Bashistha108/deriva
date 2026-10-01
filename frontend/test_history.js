fetch('http://localhost:8080/api/market-data/instruments')
  .then(res => res.json())
  .then(async insts => {
    const inst = insts[0];
    const res = await fetch(`http://localhost:8080/api/market-data/${inst.id}/history`);
    const data = await res.json();
    console.log(data.slice(-5));
  });
