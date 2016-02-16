var util_1 = require('../util');
describe('Promise', util_1.ifEnvSupports('Promise', function () {
    var testZone = global.zone.fork();
    describe('Promise API', function () {
        it('should work with .then', function (done) {
            var resolve;
            testZone.run(function () {
                new Promise(function (resolveFn) {
                    resolve = resolveFn;
                }).then(function () {
                    expect(global.zone).toBeDirectChildOf(testZone);
                    done();
                });
            });
            resolve();
        });
        it('should work with .catch', function (done) {
            var reject;
            testZone.run(function () {
                new Promise(function (resolveFn, rejectFn) {
                    reject = rejectFn;
                }).catch(function () {
                    expect(global.zone).toBeDirectChildOf(testZone);
                    done();
                });
            });
            reject();
        });
    });
    describe('fetch', util_1.ifEnvSupports('fetch', function () {
        it('should work for text response', function (done) {
            testZone.run(function () {
                global.fetch('/base/test/assets/sample.json').then(function (response) {
                    var fetchZone = global.zone;
                    expect(fetchZone).toBeDirectChildOf(testZone);
                    response.text().then(function (text) {
                        expect(global.zone).toBeDirectChildOf(fetchZone);
                        expect(text.trim()).toEqual('{"hello": "world"}');
                        done();
                    });
                });
            });
        });
        it('should work for json response', function (done) {
            testZone.run(function () {
                global.fetch('/base/test/assets/sample.json').then(function (response) {
                    var fetchZone = global.zone;
                    expect(fetchZone).toBeDirectChildOf(testZone);
                    response.json().then(function (obj) {
                        expect(global.zone).toBeDirectChildOf(fetchZone);
                        expect(obj.hello).toEqual('world');
                        done();
                    });
                });
            });
        });
        it('should work for blob response', function (done) {
            testZone.run(function () {
                global.fetch('/base/test/assets/sample.json').then(function (response) {
                    var fetchZone = global.zone;
                    expect(fetchZone).toBeDirectChildOf(testZone);
                    response.blob().then(function (blob) {
                        expect(global.zone).toBeDirectChildOf(fetchZone);
                        expect(blob instanceof Blob).toEqual(true);
                        done();
                    });
                });
            });
        });
        it('should work for arrayBuffer response', function (done) {
            testZone.run(function () {
                global.fetch('/base/test/assets/sample.json').then(function (response) {
                    var fetchZone = global.zone;
                    expect(fetchZone).toBeDirectChildOf(testZone);
                    response.arrayBuffer().then(function (blob) {
                        expect(global.zone).toBeDirectChildOf(fetchZone);
                        expect(blob instanceof ArrayBuffer).toEqual(true);
                        done();
                    });
                });
            });
        });
    }));
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbWlzZS5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9wYXRjaC9Qcm9taXNlLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEscUJBQTRCLFNBQVMsQ0FBQyxDQUFBO0FBRXRDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsb0JBQWEsQ0FBQyxTQUFTLEVBQUU7SUFDM0MsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUVsQyxRQUFRLENBQUMsYUFBYSxFQUFFO1FBQ3RCLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxVQUFVLElBQUk7WUFDekMsSUFBSSxPQUFPLENBQUM7WUFFWixRQUFRLENBQUMsR0FBRyxDQUFDO2dCQUNYLElBQUksT0FBTyxDQUFDLFVBQVUsU0FBUztvQkFDN0IsT0FBTyxHQUFHLFNBQVMsQ0FBQztnQkFDdEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNOLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2hELElBQUksRUFBRSxDQUFDO2dCQUNULENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHlCQUF5QixFQUFFLFVBQVUsSUFBSTtZQUMxQyxJQUFJLE1BQU0sQ0FBQztZQUVYLFFBQVEsQ0FBQyxHQUFHLENBQUM7Z0JBQ1gsSUFBSSxPQUFPLENBQUMsVUFBVSxTQUFTLEVBQUUsUUFBUTtvQkFDdkMsTUFBTSxHQUFHLFFBQVEsQ0FBQztnQkFDcEIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO29CQUNQLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2hELElBQUksRUFBRSxDQUFD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QywrQkFBK0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFTLFFBQVE7b0JBQ2xFLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQzVCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFOUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFTLElBQUk7d0JBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ2pELE1BQU0sQ0FBQyxJQUFJLFlBQVksV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNsRCxJQUFJLEVBQUUsQ0FBQztvQkFDVCxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRU4sQ0FBQyxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aWZFbnZTdXBwb3J0c30gZnJvbSAnLi4vdXRpbCc7XG5cbmRlc2NyaWJlKCdQcm9taXNlJywgaWZFbnZTdXBwb3J0cygnUHJvbWlzZScsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRlc3Rab25lID0gZ2xvYmFsLnpvbmUuZm9yaygpO1xuXG4gIGRlc2NyaWJlKCdQcm9taXNlIEFQSScsIGZ1bmN0aW9uICgpIHtcbiAgICBpdCgnc2hvdWxkIHdvcmsgd2l0aCAudGhlbicsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICB2YXIgcmVzb2x2ZTtcblxuICAgICAgdGVzdFpvbmUucnVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZUZuKSB7XG4gICAgICAgICAgcmVzb2x2ZSA9IHJlc29sdmVGbjtcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZXhwZWN0KGdsb2JhbC56b25lKS50b0JlRGlyZWN0Q2hpbGRPZih0ZXN0Wm9uZSk7XG4gICAgICAgICAgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHdvcmsgd2l0aCAuY2F0Y2gnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgdmFyIHJlamVjdDtcblxuICAgICAgdGVzdFpvbmUucnVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZUZuLCByZWplY3RGbikge1xuICAgICAgICAgIHJlamVjdCA9IHJlamVjdEZuO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZXhwZWN0KGdsb2JhbC56b25lKS50b0JlRGlyZWN0Q2hpbGRPZih0ZXN0Wm9uZSk7XG4gICAgICAgICAgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICByZWplY3QoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2ZldGNoJywgaWZFbnZTdXBwb3J0cygnZmV0Y2gnLCBmdW5jdGlvbiAoKSB7XG4gICAgaXQoJ3Nob3VsZCB3b3JrIGZvciB0ZXh0IHJlc3BvbnNlJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgdGVzdFpvbmUucnVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBnbG9iYWwuZmV0Y2goJy9iYXNlL3Rlc3QvYXNzZXRzL3NhbXBsZS5qc29uJykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgIHZhciBmZXRjaFpvbmUgPSBnbG9iYWwuem9uZTtcbiAgICAgICAgICBleHBlY3QoZmV0Y2hab25lKS50b0JlRGlyZWN0Q2hpbGRPZih0ZXN0Wm9uZSk7XG5cbiAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbihmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICBleHBlY3QoZ2xvYmFsLnpvbmUpLnRvQmVEaXJlY3RDaGlsZE9mKGZldGNoWm9uZSk7XG4gICAgICAgICAgICBleHBlY3QodGV4dC50cmltKCkpLnRvRXF1YWwoJ3tcImhlbGxvXCI6IFwid29ybGRcIn0nKTtcbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgd29yayBmb3IganNvbiByZXNwb25zZScsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIHRlc3Rab25lLnJ1bihmdW5jdGlvbigpIHtcbiAgICAgICAgZ2xvYmFsLmZldGNoKCcvYmFzZS90ZXN0L2Fzc2V0cy9zYW1wbGUuanNvbicpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICB2YXIgZmV0Y2hab25lID0gZ2xvYmFsLnpvbmU7XG4gICAgICAgICAgZXhwZWN0KGZldGNoWm9uZSkudG9CZURpcmVjdENoaWxkT2YodGVzdFpvbmUpO1xuXG4gICAgICAgICAgcmVzcG9uc2UuanNvbigpLnRoZW4oZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICBleHBlY3QoZ2xvYmFsLnpvbmUpLnRvQmVEaXJlY3RDaGlsZE9mKGZldGNoWm9uZSk7XG4gICAgICAgICAgICBleHBlY3Qob2JqLmhlbGxvKS50b0VxdWFsKCd3b3JsZCcpO1xuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCB3b3JrIGZvciBibG9iIHJlc3BvbnNlJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgdGVzdFpvbmUucnVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBnbG9iYWwuZmV0Y2goJy9iYXNlL3Rlc3QvYXNzZXRzL3NhbXBsZS5qc29uJykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgIHZhciBmZXRjaFpvbmUgPSBnbG9iYWwuem9uZTtcbiAgICAgICAgICBleHBlY3QoZmV0Y2hab25lKS50b0JlRGlyZWN0Q2hpbGRPZih0ZXN0Wm9uZSk7XG5cbiAgICAgICAgICByZXNwb25zZS5ibG9iKCkudGhlbihmdW5jdGlvbihibG9iKSB7XG4gICAgICAgICAgICBleHBlY3QoZ2xvYmFsLnpvbmUpLnRvQmVEaXJlY3RDaGlsZE9mKGZldGNoWm9uZSk7XG4gICAgICAgICAgICBleHBlY3QoYmxvYiBpbnN0YW5jZW9mIEJsb2IpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHdvcmsgZm9yIGFycmF5QnVmZmVyIHJlc3BvbnNlJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgdGVzdFpvbmUucnVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBnbG9iYWwuZmV0Y2goJy9iYXNlL3Rlc3QvYXNzZXRzL3NhbXBsZS5qc29uJykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgIHZhciBmZXRjaFpvbmUgPSBnbG9iYWwuem9uZTtcbiAgICAgICAgICBleHBlY3QoZmV0Y2hab25lKS50b0JlRGlyZWN0Q2hpbGRPZih0ZXN0Wm9uZSk7XG5cbiAgICAgICAgICByZXNwb25zZS5hcnJheUJ1ZmZlcigpLnRoZW4oZnVuY3Rpb24oYmxvYikge1xuICAgICAgICAgICAgZXhwZWN0KGdsb2JhbC56b25lKS50b0JlRGlyZWN0Q2hpbGRPZihmZXRjaFpvbmUpO1xuICAgICAgICAgICAgZXhwZWN0KGJsb2IgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSkpO1xuXG59KSk7XG4iXX0=