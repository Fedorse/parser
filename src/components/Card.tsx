import Button from './Button';
import { DownLoadsIcon } from '../icons/DownLoadsIcon';
import { DeleteIcon } from '../icons/DeleteIcon';
const Card = ({ code, onClick }: any) => {
	return (
		<div className="h-64 w-52 flex-1 mb-6">
			<div
				className=" w-full h-full flex flex-col justify-between p-3 pb-6 rounded-3xl 
		  bg-gray-950 border border-gray-800
		  drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]
		  hover:scale-105
		  hover:border-blue-700/50
		  transition-all duration-500
		  rounded-br-md"
			>
				<div onClick={onClick}>
					<code className="text-xs text-gray-400 ">
						{code.length > 100 ? code.slice(0, 210) + '...' : code}
					</code>
				</div>

				<div className="flex justify-end gap-4 text-white">
					<Button variant="icon">
						<DownLoadsIcon />
					</Button>
					<Button variant="icon">
						<DeleteIcon />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Card;
