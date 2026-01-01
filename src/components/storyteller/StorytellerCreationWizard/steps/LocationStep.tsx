'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LocationPicker } from '@/components/ui/location-picker';
import { Plus, MapPin, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StepProps, LocationData } from '../types';

export function LocationStep({ data, onUpdate, onNext, onBack }: StepProps) {
  const [locations, setLocations] = useState<LocationData[]>(
    data.locationData || []
  );

  const handleAddLocation = () => {
    setLocations((prev) => [
      ...prev,
      {
        locationId: '',
        locationType: 'current',
        locationName: '',
      },
    ]);
  };

  const handleRemoveLocation = (index: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLocationChange = (
    index: number,
    field: keyof LocationData,
    value: string
  ) => {
    setLocations((prev) =>
      prev.map((loc, i) =>
        i === index ? { ...loc, [field]: value } : loc
      )
    );
  };

  const handleNext = () => {
    const validLocations = locations.filter(
      (loc) => loc.locationId || loc.locationName
    );
    onUpdate({ locationData: validLocations });
    onNext();
  };

  const handleSkip = () => {
    onUpdate({ locationData: [] });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Add meaningful locations related to this storyteller's life and
          experiences.
        </p>
      </div>

      {/* Locations List */}
      <div className="space-y-4">
        {locations.map((location, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 space-y-4 bg-muted/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                {/* Location Type */}
                <div className="space-y-2">
                  <Label>Location Type</Label>
                  <Select
                    value={location.locationType}
                    onValueChange={(value: LocationData['locationType']) =>
                      handleLocationChange(index, 'locationType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="birthplace">Birthplace</SelectItem>
                      <SelectItem value="current">Current Location</SelectItem>
                      <SelectItem value="significant">
                        Significant Location
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Picker */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <LocationPicker
                    value={location.locationId}
                    textValue={location.locationName}
                    onChange={(id, text) => {
                      if (id) {
                        handleLocationChange(index, 'locationId', id);
                      }
                      if (text) {
                        handleLocationChange(index, 'locationName', text);
                      }
                    }}
                    allowFreeText={true}
                    createIfNotFound={true}
                    placeholder="Search or enter location..."
                  />
                </div>
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveLocation(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add Location Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleAddLocation}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Location
        </Button>

        {locations.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No locations added yet
            </p>
            <Button variant="outline" onClick={handleAddLocation}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Location
            </Button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button onClick={handleNext} size="lg">
            Continue to Transcript
          </Button>
        </div>
      </div>
    </div>
  );
}
