import './ExploreContainer.css';
import Cube from './Cube';

interface ContainerProps {
  name: string;
}

const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <div className="container">
      <strong>{name}</strong>
      <p>Explore <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>

      <div style={{ position: 'relative', width: '50%', aspectRatio: 1}}>
        <Cube />
      </div>
    </div>
  );
};

export default ExploreContainer;
