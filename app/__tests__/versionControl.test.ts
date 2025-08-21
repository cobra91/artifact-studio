import { VersionControl } from '../lib/versions';

describe('VersionControl', () => {
  let versionControl: VersionControl;

  beforeEach(() => {
    versionControl = new VersionControl();
    versionControl.clearVersions();
  });

  it('should save and restore a version', () => {
    const components = [{ id: '1', type: 'container', props: {}, styles: {}, children: [], position: { x: 0, y: 0 }, size: { width: 100, height: 100 } }];
    versionControl.saveVersion('test', components as any);
    const restored = versionControl.restoreVersion(versionControl.getVersions()[0].id);
    expect(restored).toEqual(components);
  });
});
