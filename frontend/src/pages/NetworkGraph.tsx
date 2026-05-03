import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { api } from '../lib/api';
import { BottomNav } from '../components/BottomNav';

interface GraphNode {
  id: number;
  label: string;
  group: string;
  size: number;
  val: number;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: number;
  target: number;
  value: number;
  label: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const groupColors: Record<string, string> = {
  support: '#ff9f0a',
  productivity: '#0a84ff',
  development: '#bf5af2',
};

export function NetworkGraph() {
  const navigate = useNavigate();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      const response = await api.get('/network/graph');
      setGraphData(response.data);
    } catch (err) {
      console.error('Failed to load graph:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(4, 1000);
    }
  }, []);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    if (!fgRef.current) return;

    fgRef.current.nodeColor((n: GraphNode) => {
      if (node && n.id === node.id) return '#ffffff';
      return groupColors[n.group] || '#888888';
    });

    fgRef.current.linkWidth((l: GraphLink) => {
      if (!node) return 1;
      const link = l as any;
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      return sourceId === node.id || targetId === node.id ? 2 : 0.5;
    });

    fgRef.current.linkColor((l: GraphLink) => {
      if (!node) return 'rgba(140,140,140,0.3)';
      const link = l as any;
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      return sourceId === node.id || targetId === node.id
        ? 'rgba(255,255,255,0.6)'
        : 'rgba(140,140,140,0.15)';
    });
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Загрузка графа...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>←</button>
        <h1 style={styles.title}>Граф сети</h1>
        <div style={styles.legend}>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: groupColors.support }} />
            Поддержка
          </span>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: groupColors.productivity }} />
            Продуктивность
          </span>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: groupColors.development }} />
            Развитие
          </span>
        </div>
      </div>

      <div style={styles.graphContainer}>
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeColor={(node: GraphNode) => groupColors[node.group] || '#888888'}
          nodeRelSize={6}
          nodeVal={(node: GraphNode) => node.val}
          nodeLabel={(node: GraphNode) => node.label}
          linkWidth={(link: GraphLink) => link.value}
          linkColor={() => 'rgba(140,140,140,0.3)'}
          backgroundColor="#000000"
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          cooldownTicks={100}
        />
      </div>

      {selectedNode && (
        <div style={styles.nodeInfo}>
          <div style={styles.nodeInfoHeader}>
            <div
              style={{
                ...styles.nodeInfoDot,
                backgroundColor: groupColors[selectedNode.group],
              }}
            />
            <span style={styles.nodeInfoName}>{selectedNode.label}</span>
            <button onClick={() => setSelectedNode(null)} style={styles.closeBtn}>✕</button>
          </div>
          <div style={styles.nodeInfoActions}>
            <button
              onClick={() => navigate(`/contacts/${selectedNode.id}`)}
              style={styles.nodeInfoBtn}
            >
              Открыть досье
            </button>
          </div>
        </div>
      )}

      <div style={styles.stats}>
        <span style={styles.statItem}>{graphData.nodes.length} контактов</span>
        <span style={styles.statItem}>{graphData.links.length} связей</span>
      </div>

      <BottomNav />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000',
    paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
    borderBottom: '1px solid var(--radar-border)',
    flexWrap: 'wrap',
    gap: '8px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--radar-accent)',
    fontSize: '20px',
    padding: '8px',
    cursor: 'pointer',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'var(--radar-text)',
    marginLeft: '8px',
  },
  legend: {
    display: 'flex',
    gap: '12px',
    marginLeft: 'auto',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: 'var(--radar-text-secondary)',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '4px',
  },
  graphContainer: {
    width: '100%',
    height: 'calc(100vh - 200px)',
    minHeight: '400px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    color: 'var(--radar-text-secondary)',
    fontSize: '16px',
  },
  nodeInfo: {
    position: 'fixed',
    bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)',
    left: '16px',
    right: '16px',
    backgroundColor: 'rgba(17,17,17,0.95)',
    borderRadius: '12px',
    padding: '16px',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--radar-border)',
    zIndex: 100,
  },
  nodeInfoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  nodeInfoDot: {
    width: '12px',
    height: '12px',
    borderRadius: '6px',
  },
  nodeInfoName: {
    flex: 1,
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--radar-text)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--radar-text-secondary)',
    fontSize: '18px',
    padding: '4px 8px',
    cursor: 'pointer',
  },
  nodeInfoActions: {
    display: 'flex',
    gap: '8px',
  },
  nodeInfoBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    padding: '12px',
    borderTop: '1px solid var(--radar-border)',
  },
  statItem: {
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
  },
};
