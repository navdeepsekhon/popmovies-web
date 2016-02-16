require('./test-env-setup');
var zone_1 = require('../lib/browser/zone');
describe('Zone', function () {
    var rootZone = global.zone;
    it('should have an id', function () {
        expect(global.zone.$id).toBeDefined();
    });
    it('forked zones should have a greater id than their parent', function () {
        expect(global.zone.fork().$id).toBeGreaterThan(global.zone.$id);
    });
    describe('hooks', function () {
        it('should fire beforeTask before a zone runs a function', function () {
            var enterSpy = jasmine.createSpy('enter');
            var myZone = global.zone.fork({
                beforeTask: enterSpy
            });
            expect(enterSpy).not.toHaveBeenCalled();
            myZone.run(function () {
                expect(enterSpy).toHaveBeenCalled();
            });
        });
        it('should fire afterTask after a zone runs a function', function () {
            var leaveSpy = jasmine.createSpy('leave');
            var myZone = global.zone.fork({
                afterTask: leaveSpy
            });
            myZone.run(function () {
                expect(leaveSpy).not.toHaveBeenCalled();
            });
            expect(leaveSpy).toHaveBeenCalled();
        });
        it('should fire onZoneCreated when a zone is forked', function () {
            var counter = 0;
            var myZone = global.zone.fork({
                onZoneCreated: function () {
                    counter += 1;
                }
            });
            myZone.run(function () {
                expect(counter).toBe(0);
                myZone.fork();
                expect(counter).toBe(1);
            });
        });
        it('should throw if onError is not defined', function () {
            expect(function () {
                global.zone.run(throwError);
            }).toThrow();
        });
        it('should fire onError if a function run by a zone throws', function () {
            var errorSpy = jasmine.createSpy('error');
            var myZone = global.zone.fork({
                onError: errorSpy
            });
            expect(errorSpy).not.toHaveBeenCalled();
            expect(function () {
                myZone.run(throwError);
            }).not.toThrow();
            expect(errorSpy).toHaveBeenCalled();
        });
        it('should allow you to override alert', function () {
            var spy = jasmine.createSpy('alert');
            var myZone = global.zone.fork({
                alert: spy
            });
            myZone.run(function () {
                alert('foo');
            });
            expect(spy).toHaveBeenCalled();
        });
        describe('eventListener hooks', function () {
            var button;
            var clickEvent;
            beforeEach(function () {
                button = document.createElement('button');
                clickEvent = document.createEvent('Event');
                clickEvent.initEvent('click', true, true);
                document.body.appendChild(button);
            });
            afterEach(function () {
                document.body.removeChild(button);
            });
            it('should support addEventListener', function () {
                var hookSpy = jasmine.createSpy('hook');
                var eventListenerSpy = jasmine.createSpy('eventListener');
                var zone = rootZone.fork({
                    $addEventListener: function (parentAddEventListener) {
                        return function (type, listener) {
                            return parentAddEventListener.call(this, type, function () {
                                hookSpy();
                                listener.apply(this, arguments);
                            });
                        };
                    }
                });
                zone.run(function () {
                    button.addEventListener('click', eventListenerSpy);
                });
                button.dispatchEvent(clickEvent);
                expect(hookSpy).toHaveBeenCalled();
                expect(eventListenerSpy).toHaveBeenCalled();
            });
            it('should support removeEventListener', function () {
                var hookSpy = jasmine.createSpy('hook');
                var eventListenerSpy = jasmine.createSpy('eventListener');
                var zone = rootZone.fork({
                    $removeEventListener: function (parentRemoveEventListener) {
                        return function (type, listener) {
                            hookSpy();
                            return parentRemoveEventListener.call(this, type, listener);
                        };
                    }
                });
                zone.run(function () {
                    button.addEventListener('click', eventListenerSpy);
                    button.removeEventListener('click', eventListenerSpy);
                });
                button.dispatchEvent(clickEvent);
                expect(hookSpy).toHaveBeenCalled();
                expect(eventListenerSpy).not.toHaveBeenCalled();
            });
        });
    });
    it('should allow zones to be run from within another zone', function () {
        var zoneA = global.zone.fork();
        var zoneB = global.zone.fork();
        zoneA.run(function () {
            zoneB.run(function () {
                expect(global.zone).toBe(zoneB);
            });
            expect(global.zone).toBe(zoneA);
        });
        expect(global.zone).toBe(rootZone);
    });
    describe('isRootZone', function () {
        it('should return true for root zone', function () {
            expect(global.zone.isRootZone()).toBe(true);
        });
        it('should return false for non-root zone', function () {
            var executed = false;
            global.zone.fork().run(function () {
                executed = true;
                expect(global.zone.isRootZone()).toBe(false);
            });
            expect(executed).toBe(true);
        });
    });
    describe('bind', function () {
        it('should execute all callbacks from root zone without forking zones', function (done) {
            // using setTimeout for the test which relies on patching via bind
            expect(global.zone.isRootZone()).toBe(true);
            setTimeout(function () {
                expect(global.zone.isRootZone()).toBe(true);
                done();
            });
        });
        it('should fork a zone for non-root zone', function (done) {
            // using setTimeout for the test which relies on patching via bind
            var childZone = global.zone.fork();
            childZone.run(function () {
                setTimeout(function () {
                    expect(global.zone).toBeDirectChildOf(childZone);
                    done();
                });
            });
        });
        it('should throw if argument is not a function', function () {
            expect(function () {
                global.zone.bind(11);
            }).toThrowError('Expecting function got: 11');
        });
    });
    describe('fork', function () {
        it('should fork deep copy', function () {
            var protoZone = { too: { deep: true } };
            var zoneA = global.zone.fork(protoZone);
            var zoneB = global.zone.fork(protoZone);
            expect(zoneA['too']).not.toBe(zoneB['too']);
            expect(zoneA['too']).toEqual(zoneB['too']);
        });
    });
    describe('bindPromiseFn', function () {
        var mockPromise = function () {
            return {
                then: function (a, b) {
                    global.zone.setTimeoutUnpatched(a, 0);
                    return mockPromise();
                }
            };
        };
        it('should return a method that returns promises that run in the correct zone', function (done) {
            var zoneA = global.zone.fork();
            zoneA.run(function () {
                var patched = zone_1.Zone.bindPromiseFn(function () {
                    return mockPromise();
                });
                patched().then(function () {
                    expect(global.zone).toBeDirectChildOf(zoneA);
                }).then(function () {
                    expect(global.zone).toBeDirectChildOf(zoneA);
                    done();
                });
            });
        });
    });
});
function throwError() {
    throw new Error();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9uZS5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC96b25lLnNwZWMudHMiXSwibmFtZXMiOlsidGhyb3dFcnJvciJdLCJtYXBwaW5ncyI6IkFBQUEsUUFBTyxrQkFBa0IsQ0FBQyxDQUFBO0FBQzFCLHFCQUFtQixxQkFBcUIsQ0FBQyxDQUFBO0FBRXpDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7SUFDZixJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBRTNCLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRTtRQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN4QyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyx5REFBeUQsRUFBRTtRQUM1RCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsRSxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxPQUFPLEVBQUU7UUFFaEIsRUFBRSxDQUFDLHNEQUFzRCxFQUFFO1lBQ3pELElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUMsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzVCLFVBQVUsRUFBRSxRQUFRO2FBQ3JCLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUV4QyxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUNULE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFHSCxFQUFFLENBQUMsb0RBQW9ELEVBQUU7WUFDdkQsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDNUIsU0FBUyxFQUFFLFFBQVE7YUFDcEIsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQztnQkFDVCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDMUMsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztRQUdILEVBQUUsQ0FBQyxpREFBaUQsRUFBRTtZQUNwRCxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDaEIsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzVCLGFBQWEsRUFBRTtvQkFDYixPQUFPLElBQUksQ0FBQyxDQUFDO2dCQUNmLENBQUM7YUFDRixDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUVULE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXhCLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFZCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFHSCxFQUFFLENBQUMsd0NBQXdDLEVBQUU7WUFDM0MsTUFBTSxDQUFDO2dCQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7UUFHSCxFQUFFLENBQUMsd0RBQXdELEVBQUU7WUFDM0QsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDNUIsT0FBTyxFQUFFLFFBQVE7YUFDbEIsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRXhDLE1BQU0sQ0FBQztnQkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUVqQixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztRQUdILEVBQUUsQ0FBQyxvQ0FBb0MsRUFBRTtZQUN2QyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JDLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUM1QixLQUFLLEVBQUUsR0FBRzthQUNYLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxHQUFHLENBQUM7Z0JBQ1QsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxxQkFBcUIsRUFBRTtZQUM5QixJQUFJLE1BQU0sQ0FBQztZQUNYLElBQUksVUFBVSxDQUFDO1lBRWYsVUFBVSxDQUFDO2dCQUNULE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMxQyxVQUFVLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDM0MsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMxQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQztZQUVILFNBQVMsQ0FBQztnQkFDUixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRTtnQkFDcEMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO29CQUN2QixpQkFBaUIsRUFBRSxVQUFTLHNCQUFzQjt3QkFDaEQsTUFBTSxDQUFDLFVBQVUsSUFBSSxFQUFFLFFBQVE7NEJBQzdCLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtnQ0FDN0MsT0FBTyxFQUFFLENBQUM7Z0NBQ1YsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ2xDLENBQUMsQ0FBQyxDQUFDO3dCQUNMLENBQUMsQ0FBQTtvQkFDSCxDQUFDO2lCQUNGLENBQUMsQ0FBQztnQkFFSCxJQUFJLENBQUMsR0FBRyxDQUFDO29CQUNQLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFDckQsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFFakMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ25DLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDOUMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsb0NBQW9DLEVBQUU7Z0JBQ3ZDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3hDLElBQUksZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztvQkFDdkIsb0JBQW9CLEVBQUUsVUFBUyx5QkFBeUI7d0JBQ3RELE1BQU0sQ0FBQyxVQUFVLElBQUksRUFBRSxRQUFROzRCQUM3QixPQUFPLEVBQUUsQ0FBQzs0QkFDVixNQUFNLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQzlELENBQUMsQ0FBQTtvQkFDSCxDQUFDO2lCQUNGLENBQUMsQ0FBQztnQkFFSCxJQUFJLENBQUMsR0FBRyxDQUFDO29CQUNQLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFDbkQsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUN4RCxDQUFDLENBQUMsQ0FBQztnQkFFSCxNQUFNLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUVqQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDbkMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBR0gsRUFBRSxDQUFDLHVEQUF1RCxFQUFFO1FBQzFELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDL0IsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUUvQixLQUFLLENBQUMsR0FBRyxDQUFDO1lBQ1IsS0FBSyxDQUFDLEdBQUcsQ0FBQztnQkFDUixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDckMsQ0FBQyxDQUFDLENBQUM7SUFHSCxRQUFRLENBQUMsWUFBWSxFQUFFO1FBRXJCLEVBQUUsQ0FBQyxrQ0FBa0MsRUFBRTtZQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQztRQUdILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRTtZQUMxQyxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFFckIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUM7Z0JBQ3JCLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9DLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBR0gsUUFBUSxDQUFDLE1BQU0sRUFBRTtRQUVmLEVBQUUsQ0FBQyxtRUFBbUUsRUFBRSxVQUFTLElBQUk7WUFDbkYsa0VBQWtFO1lBQ2xFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVDLFVBQVUsQ0FBQztnQkFDVCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxFQUFFLENBQUM7WUFDVCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBR0gsRUFBRSxDQUFDLHNDQUFzQyxFQUFFLFVBQVMsSUFBSTtZQUN0RCxrRUFBa0U7WUFDbEUsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNuQyxTQUFTLENBQUMsR0FBRyxDQUFDO2dCQUNaLFVBQVUsQ0FBQztvQkFDVCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNqRCxJQUFJLEVBQUUsQ0FBQztnQkFDVCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFHSCxFQUFFLENBQUMsNENBQTRDLEVBQUU7WUFDL0MsTUFBTSxDQUFDO2dCQUNNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFHSCxRQUFRLENBQUMsTUFBTSxFQUFFO1FBQ2YsRUFBRSxDQUFDLHVCQUF1QixFQUFFO1lBQzFCLElBQUksU0FBUyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUM7WUFDeEMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGVBQWUsRUFBRTtRQUN4QixJQUFJLFdBQVcsR0FBRztZQUNoQixNQUFNLENBQUM7Z0JBQ0wsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUM7b0JBQ1osTUFBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzdDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQzthQUNGLENBQUM7UUFDSixDQUFDLENBQUM7UUFFRixFQUFFLENBQUMsMkVBQTJFLEVBQUUsVUFBVSxJQUFJO1lBQzVGLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFL0IsS0FBSyxDQUFDLEdBQUcsQ0FBQztnQkFDUixJQUFJLE9BQU8sR0FBRyxXQUFJLENBQUMsYUFBYSxDQUFDO29CQUMvQixNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3ZCLENBQUMsQ0FBQyxDQUFDO2dCQUVILE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQztvQkFDYixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMvQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQ04sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDN0MsSUFBSSxFQUFFLENBQUM7Z0JBQ1QsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFTCxDQUFDLENBQUMsQ0FBQztBQUVIO0lBQ0VBLE1BQU1BLElBQUlBLEtBQUtBLEVBQUVBLENBQUNBO0FBQ3BCQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi90ZXN0LWVudi1zZXR1cCc7XG5pbXBvcnQge1pvbmV9IGZyb20gJy4uL2xpYi9icm93c2VyL3pvbmUnO1xuXG5kZXNjcmliZSgnWm9uZScsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJvb3Rab25lID0gZ2xvYmFsLnpvbmU7XG5cbiAgaXQoJ3Nob3VsZCBoYXZlIGFuIGlkJywgZnVuY3Rpb24gKCkge1xuICAgIGV4cGVjdChnbG9iYWwuem9uZS4kaWQpLnRvQmVEZWZpbmVkKCk7XG4gIH0pO1xuXG4gIGl0KCdmb3JrZWQgem9uZXMgc2hvdWxkIGhhdmUgYSBncmVhdGVyIGlkIHRoYW4gdGhlaXIgcGFyZW50JywgZnVuY3Rpb24gKCkge1xuICAgIGV4cGVjdChnbG9iYWwuem9uZS5mb3JrKCkuJGlkKS50b0JlR3JlYXRlclRoYW4oZ2xvYmFsLnpvbmUuJGlkKTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2hvb2tzJywgZnVuY3Rpb24gKCkge1xuXG4gICAgaXQoJ3Nob3VsZCBmaXJlIGJlZm9yZVRhc2sgYmVmb3JlIGEgem9uZSBydW5zIGEgZnVuY3Rpb24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZW50ZXJTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZW50ZXInKTtcbiAgICAgIHZhciBteVpvbmUgPSBnbG9iYWwuem9uZS5mb3JrKHtcbiAgICAgICAgYmVmb3JlVGFzazogZW50ZXJTcHlcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QoZW50ZXJTcHkpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG5cbiAgICAgIG15Wm9uZS5ydW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBleHBlY3QoZW50ZXJTcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG5cbiAgICBpdCgnc2hvdWxkIGZpcmUgYWZ0ZXJUYXNrIGFmdGVyIGEgem9uZSBydW5zIGEgZnVuY3Rpb24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbGVhdmVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnbGVhdmUnKTtcbiAgICAgIHZhciBteVpvbmUgPSBnbG9iYWwuem9uZS5mb3JrKHtcbiAgICAgICAgYWZ0ZXJUYXNrOiBsZWF2ZVNweVxuICAgICAgfSk7XG5cbiAgICAgIG15Wm9uZS5ydW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBleHBlY3QobGVhdmVTcHkpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KGxlYXZlU3B5KS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgZmlyZSBvblpvbmVDcmVhdGVkIHdoZW4gYSB6b25lIGlzIGZvcmtlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb3VudGVyID0gMDtcbiAgICAgIHZhciBteVpvbmUgPSBnbG9iYWwuem9uZS5mb3JrKHtcbiAgICAgICAgb25ab25lQ3JlYXRlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvdW50ZXIgKz0gMTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIG15Wm9uZS5ydW4oZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGV4cGVjdChjb3VudGVyKS50b0JlKDApO1xuXG4gICAgICAgIG15Wm9uZS5mb3JrKCk7XG5cbiAgICAgICAgZXhwZWN0KGNvdW50ZXIpLnRvQmUoMSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuXG4gICAgaXQoJ3Nob3VsZCB0aHJvdyBpZiBvbkVycm9yIGlzIG5vdCBkZWZpbmVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgZXhwZWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZ2xvYmFsLnpvbmUucnVuKHRocm93RXJyb3IpO1xuICAgICAgfSkudG9UaHJvdygpO1xuICAgIH0pO1xuXG5cbiAgICBpdCgnc2hvdWxkIGZpcmUgb25FcnJvciBpZiBhIGZ1bmN0aW9uIHJ1biBieSBhIHpvbmUgdGhyb3dzJywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGVycm9yU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2Vycm9yJyk7XG4gICAgICB2YXIgbXlab25lID0gZ2xvYmFsLnpvbmUuZm9yayh7XG4gICAgICAgIG9uRXJyb3I6IGVycm9yU3B5XG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KGVycm9yU3B5KS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xuXG4gICAgICBleHBlY3QoZnVuY3Rpb24gKCkge1xuICAgICAgICBteVpvbmUucnVuKHRocm93RXJyb3IpO1xuICAgICAgfSkubm90LnRvVGhyb3coKTtcblxuICAgICAgZXhwZWN0KGVycm9yU3B5KS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgYWxsb3cgeW91IHRvIG92ZXJyaWRlIGFsZXJ0JywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdhbGVydCcpO1xuICAgICAgdmFyIG15Wm9uZSA9IGdsb2JhbC56b25lLmZvcmsoe1xuICAgICAgICBhbGVydDogc3B5XG4gICAgICB9KTtcblxuICAgICAgbXlab25lLnJ1bihmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFsZXJ0KCdmb28nKTtcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3Qoc3B5KS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnZXZlbnRMaXN0ZW5lciBob29rcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBidXR0b247XG4gICAgICB2YXIgY2xpY2tFdmVudDtcblxuICAgICAgYmVmb3JlRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBjbGlja0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgIGNsaWNrRXZlbnQuaW5pdEV2ZW50KCdjbGljaycsIHRydWUsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICB9KTtcblxuICAgICAgYWZ0ZXJFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChidXR0b24pO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgc3VwcG9ydCBhZGRFdmVudExpc3RlbmVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaG9va1NweSA9IGphc21pbmUuY3JlYXRlU3B5KCdob29rJyk7XG4gICAgICAgIHZhciBldmVudExpc3RlbmVyU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2V2ZW50TGlzdGVuZXInKTtcbiAgICAgICAgdmFyIHpvbmUgPSByb290Wm9uZS5mb3JrKHtcbiAgICAgICAgICAkYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24ocGFyZW50QWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICAgICAgICByZXR1cm4gcGFyZW50QWRkRXZlbnRMaXN0ZW5lci5jYWxsKHRoaXMsIHR5cGUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGhvb2tTcHkoKTtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHpvbmUucnVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50TGlzdGVuZXJTcHkpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGJ1dHRvbi5kaXNwYXRjaEV2ZW50KGNsaWNrRXZlbnQpO1xuXG4gICAgICAgIGV4cGVjdChob29rU3B5KS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgIGV4cGVjdChldmVudExpc3RlbmVyU3B5KS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBzdXBwb3J0IHJlbW92ZUV2ZW50TGlzdGVuZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBob29rU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2hvb2snKTtcbiAgICAgICAgdmFyIGV2ZW50TGlzdGVuZXJTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZXZlbnRMaXN0ZW5lcicpO1xuICAgICAgICB2YXIgem9uZSA9IHJvb3Rab25lLmZvcmsoe1xuICAgICAgICAgICRyZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbihwYXJlbnRSZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgICAgIGhvb2tTcHkoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudFJlbW92ZUV2ZW50TGlzdGVuZXIuY2FsbCh0aGlzLCB0eXBlLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB6b25lLnJ1bihmdW5jdGlvbigpIHtcbiAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudExpc3RlbmVyU3B5KTtcbiAgICAgICAgICBidXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudExpc3RlbmVyU3B5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYnV0dG9uLmRpc3BhdGNoRXZlbnQoY2xpY2tFdmVudCk7XG5cbiAgICAgICAgZXhwZWN0KGhvb2tTcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgZXhwZWN0KGV2ZW50TGlzdGVuZXJTcHkpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cblxuICBpdCgnc2hvdWxkIGFsbG93IHpvbmVzIHRvIGJlIHJ1biBmcm9tIHdpdGhpbiBhbm90aGVyIHpvbmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHpvbmVBID0gZ2xvYmFsLnpvbmUuZm9yaygpO1xuICAgIHZhciB6b25lQiA9IGdsb2JhbC56b25lLmZvcmsoKTtcblxuICAgIHpvbmVBLnJ1bihmdW5jdGlvbiAoKSB7XG4gICAgICB6b25lQi5ydW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBleHBlY3QoZ2xvYmFsLnpvbmUpLnRvQmUoem9uZUIpO1xuICAgICAgfSk7XG4gICAgICBleHBlY3QoZ2xvYmFsLnpvbmUpLnRvQmUoem9uZUEpO1xuICAgIH0pO1xuICAgIGV4cGVjdChnbG9iYWwuem9uZSkudG9CZShyb290Wm9uZSk7XG4gIH0pO1xuXG5cbiAgZGVzY3JpYmUoJ2lzUm9vdFpvbmUnLCBmdW5jdGlvbigpIHtcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgZm9yIHJvb3Qgem9uZScsIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwZWN0KGdsb2JhbC56b25lLmlzUm9vdFpvbmUoKSkudG9CZSh0cnVlKTtcbiAgICB9KTtcblxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgZm9yIG5vbi1yb290IHpvbmUnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBleGVjdXRlZCA9IGZhbHNlO1xuXG4gICAgICBnbG9iYWwuem9uZS5mb3JrKCkucnVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBleGVjdXRlZCA9IHRydWU7XG4gICAgICAgIGV4cGVjdChnbG9iYWwuem9uZS5pc1Jvb3Rab25lKCkpLnRvQmUoZmFsc2UpO1xuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChleGVjdXRlZCkudG9CZSh0cnVlKTtcbiAgICB9KTtcbiAgfSk7XG5cblxuICBkZXNjcmliZSgnYmluZCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgaXQoJ3Nob3VsZCBleGVjdXRlIGFsbCBjYWxsYmFja3MgZnJvbSByb290IHpvbmUgd2l0aG91dCBmb3JraW5nIHpvbmVzJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgLy8gdXNpbmcgc2V0VGltZW91dCBmb3IgdGhlIHRlc3Qgd2hpY2ggcmVsaWVzIG9uIHBhdGNoaW5nIHZpYSBiaW5kXG4gICAgICBleHBlY3QoZ2xvYmFsLnpvbmUuaXNSb290Wm9uZSgpKS50b0JlKHRydWUpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgZXhwZWN0KGdsb2JhbC56b25lLmlzUm9vdFpvbmUoKSkudG9CZSh0cnVlKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgZm9yayBhIHpvbmUgZm9yIG5vbi1yb290IHpvbmUnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAvLyB1c2luZyBzZXRUaW1lb3V0IGZvciB0aGUgdGVzdCB3aGljaCByZWxpZXMgb24gcGF0Y2hpbmcgdmlhIGJpbmRcbiAgICAgIHZhciBjaGlsZFpvbmUgPSBnbG9iYWwuem9uZS5mb3JrKCk7XG4gICAgICBjaGlsZFpvbmUucnVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV4cGVjdChnbG9iYWwuem9uZSkudG9CZURpcmVjdENoaWxkT2YoY2hpbGRab25lKTtcbiAgICAgICAgICBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgdGhyb3cgaWYgYXJndW1lbnQgaXMgbm90IGEgZnVuY3Rpb24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICBleHBlY3QoZnVuY3Rpb24gKCkge1xuICAgICAgICAoPEZ1bmN0aW9uPmdsb2JhbC56b25lLmJpbmQpKDExKTtcbiAgICAgIH0pLnRvVGhyb3dFcnJvcignRXhwZWN0aW5nIGZ1bmN0aW9uIGdvdDogMTEnKTtcbiAgICB9KTtcbiAgfSk7XG5cblxuICBkZXNjcmliZSgnZm9yaycsIGZ1bmN0aW9uICgpIHtcbiAgICBpdCgnc2hvdWxkIGZvcmsgZGVlcCBjb3B5JywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHByb3RvWm9uZSA9IHsgdG9vOiB7IGRlZXA6IHRydWUgfSB9O1xuICAgICAgdmFyIHpvbmVBID0gZ2xvYmFsLnpvbmUuZm9yayhwcm90b1pvbmUpO1xuICAgICAgdmFyIHpvbmVCID0gZ2xvYmFsLnpvbmUuZm9yayhwcm90b1pvbmUpO1xuXG4gICAgICBleHBlY3Qoem9uZUFbJ3RvbyddKS5ub3QudG9CZSh6b25lQlsndG9vJ10pO1xuICAgICAgZXhwZWN0KHpvbmVBWyd0b28nXSkudG9FcXVhbCh6b25lQlsndG9vJ10pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYmluZFByb21pc2VGbicsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbW9ja1Byb21pc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRoZW46IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgKDxhbnk+Z2xvYmFsKS56b25lLnNldFRpbWVvdXRVbnBhdGNoZWQoYSwgMCk7XG4gICAgICAgICAgcmV0dXJuIG1vY2tQcm9taXNlKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIGEgbWV0aG9kIHRoYXQgcmV0dXJucyBwcm9taXNlcyB0aGF0IHJ1biBpbiB0aGUgY29ycmVjdCB6b25lJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgIHZhciB6b25lQSA9IGdsb2JhbC56b25lLmZvcmsoKTtcblxuICAgICAgem9uZUEucnVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHBhdGNoZWQgPSBab25lLmJpbmRQcm9taXNlRm4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIG1vY2tQcm9taXNlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHBhdGNoZWQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBleHBlY3QoZ2xvYmFsLnpvbmUpLnRvQmVEaXJlY3RDaGlsZE9mKHpvbmVBKTtcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZXhwZWN0KGdsb2JhbC56b25lKS50b0JlRGlyZWN0Q2hpbGRPZih6b25lQSk7XG4gICAgICAgICAgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxufSk7XG5cbmZ1bmN0aW9uIHRocm93RXJyb3IgKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoKTtcbn1cbiJdfQ==