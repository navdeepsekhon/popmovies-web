var util_1 = require('../util');
function supportsGeolocation() {
    return 'geolocation' in navigator;
}
supportsGeolocation.message = 'Geolocation';
describe('Geolocation', util_1.ifEnvSupports(supportsGeolocation, function () {
    var testZone = global.zone.fork();
    it('should work for getCurrentPosition', function (done) {
        testZone.run(function () {
            navigator.geolocation.getCurrentPosition(function (pos) {
                expect(global.zone).toBeDirectChildOf(testZone);
                done();
            });
        });
    });
    it('should work for watchPosition', function (done) {
        testZone.run(function () {
            var watchId;
            watchId = navigator.geolocation.watchPosition(function (pos) {
                expect(global.zone).toBeDirectChildOf(testZone);
                navigator.geolocation.clearWatch(watchId);
                done();
            });
        });
    });
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VvbG9jYXRpb24uc3BlYy5tYW51YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L3BhdGNoL2dlb2xvY2F0aW9uLnNwZWMubWFudWFsLnRzIl0sIm5hbWVzIjpbInN1cHBvcnRzR2VvbG9jYXRpb24iXSwibWFwcGluZ3MiOiJBQUFBLHFCQUE0QixTQUFTLENBQUMsQ0FBQTtBQUV0QztJQUNFQSxNQUFNQSxDQUFDQSxhQUFhQSxJQUFJQSxTQUFTQSxDQUFDQTtBQUNwQ0EsQ0FBQ0E7QUFDSyxtQkFBb0IsQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDO0FBRW5ELFFBQVEsQ0FBQyxhQUFhLEVBQUUsb0JBQWEsQ0FBQyxtQkFBbUIsRUFBRTtJQUN6RCxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBRWxDLEVBQUUsQ0FBQyxvQ0FBb0MsRUFBRSxVQUFTLElBQUk7UUFDcEQsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUNYLFNBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQ3RDLFVBQVMsR0FBRztnQkFDVixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLEVBQUUsQ0FBQztZQUNULENBQUMsQ0FDRixDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywrQkFBK0IsRUFBRSxVQUFTLElBQUk7UUFDL0MsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUNYLElBQUksT0FBTyxDQUFDO1lBQ1osT0FBTyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUMzQyxVQUFTLEdBQUc7Z0JBQ1YsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDaEQsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzFDLElBQUksRUFBRSxDQUFDO1lBQ1QsQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aWZFbnZTdXBwb3J0c30gZnJvbSAnLi4vdXRpbCc7XG5cbmZ1bmN0aW9uIHN1cHBvcnRzR2VvbG9jYXRpb24oKSB7XG4gIHJldHVybiAnZ2VvbG9jYXRpb24nIGluIG5hdmlnYXRvcjtcbn1cbig8YW55PnN1cHBvcnRzR2VvbG9jYXRpb24pLm1lc3NhZ2UgPSAnR2VvbG9jYXRpb24nO1xuXG5kZXNjcmliZSgnR2VvbG9jYXRpb24nLCBpZkVudlN1cHBvcnRzKHN1cHBvcnRzR2VvbG9jYXRpb24sIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRlc3Rab25lID0gZ2xvYmFsLnpvbmUuZm9yaygpO1xuXG4gIGl0KCdzaG91bGQgd29yayBmb3IgZ2V0Q3VycmVudFBvc2l0aW9uJywgZnVuY3Rpb24oZG9uZSkge1xuICAgIHRlc3Rab25lLnJ1bihmdW5jdGlvbigpIHtcbiAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oXG4gICAgICAgIGZ1bmN0aW9uKHBvcykge1xuICAgICAgICAgIGV4cGVjdChnbG9iYWwuem9uZSkudG9CZURpcmVjdENoaWxkT2YodGVzdFpvbmUpO1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCB3b3JrIGZvciB3YXRjaFBvc2l0aW9uJywgZnVuY3Rpb24oZG9uZSkge1xuICAgIHRlc3Rab25lLnJ1bihmdW5jdGlvbigpIHtcbiAgICAgIHZhciB3YXRjaElkO1xuICAgICAgd2F0Y2hJZCA9IG5hdmlnYXRvci5nZW9sb2NhdGlvbi53YXRjaFBvc2l0aW9uKFxuICAgICAgICBmdW5jdGlvbihwb3MpIHtcbiAgICAgICAgICBleHBlY3QoZ2xvYmFsLnpvbmUpLnRvQmVEaXJlY3RDaGlsZE9mKHRlc3Rab25lKTtcbiAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uY2xlYXJXYXRjaCh3YXRjaElkKTtcbiAgICAgICAgICBkb25lKCk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH0pO1xufSkpO1xuIl19