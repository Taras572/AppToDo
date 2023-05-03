import { TestBed } from '@angular/core/testing';

import { SettingsProfileService } from './settings-profile.service';

describe('SettingsProfileService', () => {
  let service: SettingsProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
