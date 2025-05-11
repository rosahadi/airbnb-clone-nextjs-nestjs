import { LuFolderCheck } from "react-icons/lu";
import Title from "./Title";

function Amenities({ amenities }: { amenities: string }) {
  const amenitiesList: string[] = JSON.parse(
    amenities.replace(/\\"/g, '"')
  );

  console.log("Parsed amenities:", amenitiesList);

  if (!amenitiesList.length) return null;

  return (
    <div className="mt-4">
      <Title text="What this place offers" />
      <div className="grid md:grid-cols-2 gap-x-4">
        {amenitiesList.map((amenity) => (
          <div
            key={amenity}
            className="flex items-center gap-x-4 mb-2"
          >
            <LuFolderCheck className="h-6 w-6 text-primary" />
            <span className="font-light text-sm capitalize">
              {amenity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Amenities;
