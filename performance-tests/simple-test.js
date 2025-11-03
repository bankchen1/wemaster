import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 5,
  duration: '30s',
};

export default function() {
    let response = http.get('http://localhost:3002/api/v1/offerings');
    check(response, {
        'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
        'response time < 1000ms': (r) => r.timings.duration < 1000,
    });
}