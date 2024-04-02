import { fork } from 'redux-saga/effects';
import watcher from './watchers';

export default function* startForman() {
	yield fork(watcher);
}
