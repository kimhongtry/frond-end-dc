// src/components/IDCard.tsx
interface IDCardProps {
  name: string;
  email: string;
  photoUrl: string;
  cardType: string;
  issuedDate: string;
}

const IDCard: React.FC<IDCardProps> = ({
  name,
  email,
  photoUrl,
  cardType,
  issuedDate,
}) => {
  return (
    <div className="bg-white border shadow-md rounded-lg p-4 text-center">
      <img
        src={photoUrl}
        alt={name}
        className="w-24 h-24 rounded-full mx-auto mb-4"
      />
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-sm text-gray-600">{email}</p>
      <p className="text-sm text-blue-600 font-semibold">{cardType}</p>
      <p className="text-xs text-gray-400">Issued: {issuedDate}</p>
    </div>
  );
};

export default IDCard;
