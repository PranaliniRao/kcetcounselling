import { useState } from "react";

function App() {
  const [rank, setRank] = useState("");

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-5">
        KCET Counselling Assistant
      </h1>

      <input
        type="number"
        placeholder="Enter Rank"
        value={rank}
        onChange={(e) => setRank(e.target.value)}
        className="border p-2"
      />
    </div>
  );
}

export default App;