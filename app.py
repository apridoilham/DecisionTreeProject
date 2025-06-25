import sys
import os
import math
import time
import json
import yaml
import pickle
import logging
import threading
import queue
import signal
import numpy as np
import pandas as pd
import graphviz
from abc import ABC, abstractmethod
from contextlib import contextmanager
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Set, Any, Tuple, Union, Callable, TypeVar, Generic
from anytree import Node, RenderTree, PreOrderIter
from anytree.exporter import DotExporter
from rich.console import Console
from rich.logging import RichHandler
from rich.progress import track, Progress
from rich.panel import Panel
from rich.table import Table
from rich.style import Style
from rich.layout import Layout
from rich.text import Text
from tabulate import tabulate
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.serving import WSGIRequestHandler
import io
import base64
import tempfile

T = TypeVar('T')
D = TypeVar('D')

logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[RichHandler(rich_tracebacks=True)]
)
logger = logging.getLogger("decision_tree")
console = Console()

class DecisionTreeError(Exception):
    pass

class ValidationError(DecisionTreeError):
    pass

class VisualizationError(DecisionTreeError):
    pass

class DataError(DecisionTreeError):
    pass

class ConfigurationError(DecisionTreeError):
    pass

@dataclass
class DecisionTreeConfig:
    min_samples_split: int = 2
    max_depth: Optional[int] = None
    min_information_gain: float = 0.0

    visualization: Dict[str, Any] = field(default_factory=lambda: {
        'output_format': 'png',
        'theme': 'modern',
        'dpi': 300,
        'font_family': 'Arial',
        'show_statistics': True,
        'node_spacing': 1.2,
        'layout_direction': 'TB'
    })

    output: Dict[str, Any] = field(default_factory=lambda: {
        'base_dir': 'output',
        'create_timestamp_folder': True,
        'save_metadata': True,
        'save_model': True,
        'compression': True
    })

    logging: Dict[str, Any] = field(default_factory=lambda: {
        'level': 'INFO',
        'save_logs': True,
        'log_file': 'decision_tree.log',
        'log_format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    })

    performance: Dict[str, Any] = field(default_factory=lambda: {
        'parallel_processing': False,
        'max_workers': None,
        'chunk_size': 1000,
        'cache_results': True
    })

    def __post_init__(self):
        self.validate()

    def validate(self) -> None:
        if self.min_samples_split < 2:
            raise ConfigurationError("min_samples_split must be at least 2")
        if self.max_depth is not None and self.max_depth < 1:
            raise ConfigurationError("max_depth must be at least 1")
        if not 0 <= self.min_information_gain <= 1:
            raise ConfigurationError("min_information_gain must be between 0 and 1")

    @classmethod
    def from_yaml(cls, yaml_path: Path) -> 'DecisionTreeConfig':
        try:
            with open(yaml_path) as f:
                config_dict = yaml.safe_load(f)
            return cls(**config_dict)
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            return cls()

    def to_yaml(self, yaml_path: Path) -> None:
        try:
            with open(yaml_path, 'w') as f:
                yaml.dump(asdict(self), f, default_flow_style=False)
        except Exception as e:
            logger.error(f"Error saving config: {e}")

class Observer(ABC):
    @abstractmethod
    def update(self, subject: Any, *args, **kwargs) -> None:
        pass

class Subject(ABC):
    def __init__(self):
        self._observers: List[Observer] = []

    def attach(self, observer: Observer) -> None:
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer: Observer) -> None:
        try:
            self._observers.remove(observer)
        except ValueError:
            pass

    def notify(self, *args, **kwargs) -> None:
        for observer in self._observers:
            observer.update(self, *args, **kwargs)

class TreeMetrics(Subject):
    def __init__(self):
        super().__init__()
        self.created_at = datetime.now()
        self.features: List[str] = []
        self.target: str = ""
        self.node_count: int = 0
        self.max_depth: int = 0
        self.leaf_count: int = 0
        self.split_counts: Dict[str, int] = {}
        self.feature_importance: Dict[str, float] = {}
        self.build_time: float = 0

    def update_metrics(self, node: Node) -> None:
        decision_depth = node.depth // 2

        if node.name.startswith('Split:'):
            feature = node.name.split(': ')[1]
            self.split_counts[feature] = self.split_counts.get(feature, 0) + 1
            self.node_count += 1
            if decision_depth > self.max_depth:
                self.max_depth = decision_depth

        elif node.name.startswith('Leaf:'):
            self.leaf_count += 1
            self.node_count += 1
            if decision_depth > self.max_depth:
                self.max_depth = decision_depth
        
        self.notify('metrics_updated', node=node)

    def calculate_feature_importance(self) -> None:
        total_splits = sum(self.split_counts.values())
        if total_splits > 0:
            self.feature_importance = {
                feature: count / total_splits
                for feature, count in self.split_counts.items()
            }

    def to_dict(self) -> Dict[str, Any]:
        self.calculate_feature_importance()
        return {
            'created_at': self.created_at.isoformat(),
            'features': self.features,
            'target': self.target,
            'node_count': self.node_count,
            'max_depth': self.max_depth,
            'leaf_count': self.leaf_count,
            'split_counts': self.split_counts,
            'feature_importance': self.feature_importance,
            'build_time': round(self.build_time, 3)
        }

    def save(self, path: Path) -> None:
        with open(path, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)

class TreeVisualizer(Observer):
    def __init__(self, config: DecisionTreeConfig):
        self.config = config

    def update(self, subject: Subject, *args, **kwargs) -> None:
        pass

class WebTreeVisualizer(TreeVisualizer):
    def create_visualization_base64(self, tree: Node, metrics: Optional[TreeMetrics] = None) -> str:
        try:
            g = graphviz.Digraph(graph_attr={'dpi': '300'})

            g.attr(
                rankdir='TB',
                splines='polyline',
                ranksep='1.4',
                nodesep='0.6',
                bgcolor='transparent',
                overlap='false'
            )
            g.attr('node', 
                   style='filled', 
                   fontname='Arial', 
                   fontsize='14',
                   penwidth='1.5'
            )
            g.attr('edge', 
                   fontname='Arial', 
                   fontsize='12', 
                   fontcolor='#4A5568',
                   color='#CBD5E0',
                   arrowhead='none'
            )

            for node in PreOrderIter(tree):
                node_id = str(id(node))
                
                if node.name.startswith("Leaf:"):
                    label = node.name.replace("Leaf: ", "").strip()
                    g.node(node_id, label, shape='box', style='filled,rounded', 
                           fillcolor='#F0FFF4', color='#9AE6B4', fontcolor='#2F855A')
                
                elif node.name.startswith("Split:"):
                    label = node.name.replace("Split: ", "").strip()
                    g.node(node_id, label, shape='ellipse', 
                           fillcolor='#EBF8FF', color='#90CDF4', fontcolor='#2C5282')

                if node.parent and not node.parent.is_root:
                    if not node.parent.name.startswith(("Split:", "Leaf:")):
                        grandparent = node.parent.parent
                        if grandparent:
                            grandparent_id = str(id(grandparent))
                            edge_label = str(node.parent.name).strip()
                            g.edge(grandparent_id, node_id, label=f' {edge_label} ')

            png_data = g.pipe(format='png')
            base64_data = base64.b64encode(png_data).decode('utf-8')
            return base64_data
        except Exception as e:
            raise VisualizationError(f"Error creating visualization: {e}")


class TreeBuilder(Subject):
    def __init__(self, config: Optional[DecisionTreeConfig] = None):
        super().__init__()
        self.config = config or DecisionTreeConfig()
        self.metrics = TreeMetrics()
        self.visualizer = TreeVisualizer(self.config)
        self.tree: Optional[Node] = None
        self.metrics.attach(self.visualizer)

    def entropy(self, data: pd.DataFrame, target_column: str) -> float:
        if target_column not in data.columns:
            raise ValidationError(f"Target column '{target_column}' not found in data")
        values = data[target_column].value_counts(normalize=True)
        entropy_value = -np.sum(values * np.log2(values + np.finfo(float).eps))
        return entropy_value

    def information_gain(self, data: pd.DataFrame, split_column: str, target_column: str) -> float:
        total_entropy = self.entropy(data, target_column)
        values = data[split_column].unique()
        weighted_entropy = 0
        for value in values:
            subset = data[data[split_column] == value]
            weight = len(subset) / len(data)
            weighted_entropy += weight * self.entropy(subset, target_column)
        return total_entropy - weighted_entropy

    def best_split(self, data: pd.DataFrame, features: List[str], target_column: str, depth: int) -> str:
        gains = {feature: self.information_gain(data, feature, target_column) for feature in features}
        return max(gains, key=gains.get)

    def _build_recursive(self, data: pd.DataFrame, features: List[str], target_column: str, parent: Optional[Node] = None, depth: int = 0) -> Node:
        if len(data[target_column].unique()) == 1:
            value = data[target_column].iloc[0]
            return Node(f"Leaf: {value}", parent=parent, samples=len(data))

        if not features or (self.config.max_depth and depth >= self.config.max_depth):
            majority_class = data[target_column].mode()[0]
            return Node(f"Leaf: {majority_class}", parent=parent, samples=len(data))

        best_feature = self.best_split(data, features, target_column, depth=depth)
        split_node = Node(f"Split: {best_feature}", parent=parent, samples=len(data))
        
        remaining_features = [f for f in features if f != best_feature]
        for value in sorted(data[best_feature].unique()):
            subset = data[data[best_feature] == value]
            if not subset.empty:
                value_node = Node(str(value), parent=split_node, samples=len(subset))
                self._build_recursive(subset, remaining_features, target_column, parent=value_node, depth=depth + 1)
        
        return split_node

    def build_tree(self, data: pd.DataFrame, features: List[str], target_column: str) -> Node:
        self.metrics = TreeMetrics()
        self.metrics.features = features.copy()
        self.metrics.target = target_column
        start_time = time.time()

        self.tree = self._build_recursive(data, features, target_column, depth=0)
        
        self.metrics.build_time = time.time() - start_time
        for node in PreOrderIter(self.tree):
            self.metrics.update_metrics(node)
            
        return self.tree

class WebTreeBuilder(TreeBuilder):
    def __init__(self, config: Optional[DecisionTreeConfig] = None):
        super().__init__(config)
        self.visualizer = WebTreeVisualizer(self.config)
        self.build_logs = []

    def log_message(self, message: str, level: str = 'info', indent: int = 0) -> None:
        formatted_message = f"{'  ' * indent}{message}"
        self.build_logs.append(formatted_message)

    def information_gain(self, data: pd.DataFrame, split_column: str, target_column: str) -> float:
        total_entropy = self.entropy(data, target_column)
        values = data[split_column].unique()
        weighted_entropy = 0
        for value in values:
            subset = data[data[split_column] == value]
            weight = len(subset) / len(data)
            subset_entropy = self.entropy(subset, target_column)
            weighted_entropy += weight * subset_entropy
        gain = total_entropy - weighted_entropy
        return gain
    
    def best_split(self, data: pd.DataFrame, features: List[str], target_column: str, depth: int) -> str:
        self.log_message(f"Mencari split terbaik dari {features}...", indent=depth)
        gains = {}
        for feature in features:
            gain = self.information_gain(data, feature, target_column)
            gains[feature] = gain
            self.log_message(f"- Gain({feature}) = {gain:.4f}", indent=depth + 1)

        best_feature = max(gains, key=gains.get)
        self.log_message(f"⭐ Split terbaik: {best_feature} (Gain = {gains[best_feature]:.4f})\n", indent=depth)
        return best_feature

    def build_tree(self, data: pd.DataFrame, features: List[str], target_column: str) -> Node:
        self.build_logs = []
        self.log_message("Memulai pembangunan pohon keputusan...", level='info')
        self.log_message(f"Total sampel: {len(data)}", level='info')
        self.log_message(f"Fitur: {features}", level='info')
        self.log_message(f"Target: {target_column}\n", level='info')
        return super().build_tree(data, features, target_column)

app = Flask(__name__)
app.secret_key = os.environ.get('APP_SECRET_KEY', os.urandom(24))
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/build_tree', methods=['POST'])
def build_tree_endpoint():
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type harus application/json'}), 400

        req_data = request.json
        if not req_data:
            return jsonify({'error': 'Data JSON tidak boleh kosong'}), 400

        parameters = [p.strip() for p in req_data.get('parameters', '').split(',') if p.strip()]
        if len(parameters) < 2:
            return jsonify({'error': 'Minimal harus ada 2 parameter (1 fitur, 1 target)'}), 400

        data_rows_str = req_data.get('data', '')
        if not data_rows_str.strip():
            return jsonify({'error': 'Dataset tidak boleh kosong'}), 400

        data_rows = [row.strip().split(',') for row in data_rows_str.split('\n') if row.strip()]
        if len(data_rows) < 2:
            return jsonify({'error': 'Minimal harus ada 2 baris data'}), 400

        for i, row in enumerate(data_rows, 1):
            if len(row) != len(parameters):
                return jsonify({
                    'error': f'Baris data ke-{i} memiliki {len(row)} kolom, seharusnya {len(parameters)}.'
                }), 400

        df = pd.DataFrame(data_rows, columns=parameters)
        features = parameters[:-1]
        target = parameters[-1]

        tree_builder = WebTreeBuilder(DecisionTreeConfig())
        tree = tree_builder.build_tree(df, features, target)

        visualization_b64 = tree_builder.visualizer.create_visualization_base64(
            tree, tree_builder.metrics
        )

        response_data = {
            'success': True,
            'logs': tree_builder.build_logs,
            'visualization': visualization_b64,
            'metrics': tree_builder.metrics.to_dict()
        }

        return jsonify(response_data)

    except Exception as e:
        logger.exception("Error in build_tree endpoint:")
        return jsonify({'error': f'Terjadi kesalahan internal: {str(e)}'}), 500

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'Ukuran data terlalu besar. Maksimal 10MB.'}), 413

@app.route("/healthz")
def health_check():
    return "OK", 200

if __name__ == "__main__":
    try:
        Path('output').mkdir(exist_ok=True)
        Path('static').mkdir(exist_ok=True)
        Path('templates').mkdir(exist_ok=True)

        WSGIRequestHandler.protocol_version = "HTTP/1.1"

        port = 5001
        print(f"\n🚀 Starting server on port {port}...")
        print(f"💻 Access the application at http://localhost:{port}")

        app.run(
            debug=True,
            host='0.0.0.0',
            port=port,
            threaded=True
        )

    except Exception as e:
        logger.exception("Failed to start application:")
        sys.exit(1)