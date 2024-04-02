import { _time } from "../clients/bond.api.client";


export const syncTime = () => {
	let startTime = new Date().getTime();

	return _time()
        .then(response => {
			let requestTime = new Date().getTime() - startTime;
			let serverTime = response.data.VNDDateTime + requestTime / 2;
			// sessionStorage.setItem('startTimeCounter', serverTime);
			return serverTime;
		})
		.catch(e => {
			let now = new Date().getTime();
			let requestTime = now - startTime;
			let serverTime = now + requestTime / 2;
			// sessionStorage.setItem('startTimeCounter', serverTime);
			return serverTime;
		});
};

export const init = cb => {
	syncTime().then(serverTime => {
		cb(serverTime);
	});
};

class Timer {
	constructor() {
		this.time = new Date().getTime();
	}

	setTime(time) {
		this.time = time;
	}

	getTime() {
		return this.time;
	}

	clock() {
		setInterval(() => {
			this.time += 5000;
		}, 5000);
	}
}

let _timer = new Timer();

init(currentTime => {
	_timer.setTime(currentTime);
	_timer.clock();
});

export const timer = _timer;