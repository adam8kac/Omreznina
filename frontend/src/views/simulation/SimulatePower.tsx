import { useEffect, useState } from 'react';
import { getAvailableDevices, simulateUsage, SimulationRequest } from 'src/index';

export const SimulatePower = () => {
	const [availableDevices, setAvailableDevices] = useState<string[]>([]);
	const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
	const [result, setResult] = useState<any | null>(null);

	useEffect(() => {
		getAvailableDevices().then(setAvailableDevices);
	}, []);

	const handleSimulate = async () => {
		const request: SimulationRequest = {
			selectedDevices: selectedDevices,
			agreedPowers: {
				1: 5000,
				2: 4000,
				3: 3500,
				4: 3000,
				5: 2000,
			},
			season: 'VISJA',
			dayType: 'DELOVNI_DAN',
		};

		const simResult = await simulateUsage(request);
		setResult(simResult);
	};

	return (
		<div>
			<h2>Izberi naprave</h2>
			{availableDevices.map((device) => (
				<div key={device}>
					<label>
						<input
							type="checkbox"
							value={device}
							onChange={(e) => {
								const isChecked = e.target.checked;
								setSelectedDevices((prev) =>
									isChecked ? [...prev, device] : prev.filter((d) => d !== device),
								);
							}}
						/>
						{device}
					</label>
				</div>
			))}

			<button onClick={handleSimulate}>Simuliraj porabo</button>

			{result && (
				<div>
					<h3>Rezultat:</h3>
					<p>Blok: {result.currentBlock}</p>
					<p>Dogovorjena moč: {result.agreedPower} ({result.agreedPower/1000} kW)</p>
					<p>Poraba: {result.totalUsedPower} W ({result.totalUsedPower/1000} kW)</p>
					<p>
						Status:{' '}
						<span style={{ color: result.status === 'PREKORAČITEV' ? 'red' : 'green' }}>
							{result.status}
						</span>
					</p>
					{result.exceptionalDevices.length > 0 && (
						<div>
							<p>Izjemne naprave:</p>
							<ul>
								{result.exceptionalDevices.map((ex: string) => (
									<li key={ex}>{ex}</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default SimulatePower;

