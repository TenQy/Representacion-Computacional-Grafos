document.addEventListener('DOMContentLoaded', function() {
    let matrix, vertexList;

            function dijkstra(matrix, vertices, startVertex, endVertex) {
            const numVertices = vertices.length;
            const startIndex = vertices.indexOf(startVertex);
            const endIndex = vertices.indexOf(endVertex);

            const distances = new Array(numVertices).fill(Infinity);
            const visited = new Array(numVertices).fill(false);
            const previous = new Array(numVertices).fill(null);

            distances[startIndex] = 0;

            for (let i = 0; i < numVertices; ++i) {
                let minDistance = Infinity;
                let currentVertex = -1;

                for (let j = 0; j < numVertices; j++) {
                    if (!visited[j] && distances[j] < minDistance) {
                        minDistance = distances[j];
                        currentVertex = j;
                    }
                }

                if (currentVertex === -1) break

                visited[currentVertex] = true;

                for (let neighbor = 0; neighbor < numVertices; neighbor++) {
                    if (!visited[neighbor] && matrix[currentVertex][neighbor] > 0) {
                        const newDistance = distances[currentVertex] + matrix[currentVertex][neighbor];
                        if (newDistance < distances[neighbor]) {
                            distances[neighbor] = newDistance;
                            previous[neighbor] = currentVertex;
                        }
                    }
                }
            }

            return { distances, previous };
        }

    const button = document.getElementById('generateGraph');
    button.addEventListener('click', function(){
        const rows = document.querySelectorAll('#inputTable tbody tr');
        console.log("Total de filas tbody encontradas:", rows.length);
        console.log("Elementos tbody en la página:", document.querySelectorAll('tbody').length);
        const routes = [];
        const vertices = new Set();

        rows.forEach(function(row, index) {
            const inputs = row.querySelectorAll('input');
            console.log(`Fila ${index}: encontrados ${inputs.length} inputs`);
            
            if (inputs.length >= 3) {
                const origen = inputs[0].value.trim();
                const destino = inputs[1].value.trim();
                const peso = inputs[2].value.trim();
            
        
        console.log(`Fila ${index}: ${origen} -> ${destino}, peso: ${peso}`);

            if(origen && destino && peso) {
                routes.push({
                    from: origen,
                    to: destino,
                    weight: parseInt(peso)
                });

                vertices.add(origen);
                vertices.add(destino);
            }
            }
        });

        console.log("Rutas validas", routes);
        console.log("Vertices unicos: ", Array.from(vertices));

        const isDirected = document.getElementById('directed').checked;
        console.log("Grafo dirigido: ", isDirected);

        vertexList = Array.from(vertices).sort();
        console.log("Vertices ordenados: ", vertexList);

        const matrixSize = vertexList.length;
        matrix = [];

        for (let i = 0; i < matrixSize; i++) {
            matrix[i] = [];
            for (let j = 0; j < matrixSize; j++) {
                matrix[i][j] = 0;
            }
        }

        console.log("Matriz inicial: ", matrix)

        routes.forEach(function(route) {
            const fromIndex = vertexList.indexOf(route.from);
            const toIndex = vertexList.indexOf(route.to);

            matrix[fromIndex][toIndex] = route.weight;

            if (!isDirected) {
                matrix[toIndex][fromIndex] = route.weight;
            }
        });

        console.log("Matriz final: ", matrix);

        function displayMatrix(matrix, vertices) {
            let htmlTable = '<h3>Matriz de Adyecencia</h3>';
            htmlTable += '<table border="1">';

            htmlTable += '<tr><th></th>';
            vertices.forEach(function(vertex) {
                htmlTable += `<th>${vertex}</th>`;
            });
            htmlTable += '</tr>';

            vertices.forEach(function(rowVertex, i) {
                htmlTable += `<tr><th>${rowVertex}</th>`;
                matrix[i].forEach(function(value) {
                    htmlTable += `<td>${value}</td>`;
                });
                htmlTable += '</tr>';
            });

            htmlTable += '</table>';

            const resultsDiv = document.getElementById('adjacencyMatrix');
            resultsDiv.innerHTML = '';
            resultsDiv.innerHTML = htmlTable;
        }

        function displayGraph(routes, vertices, isDirected) {
            const nodes = vertices.map(vertex => ({
                id: vertex,
                label: vertex,
                color: '#97C2FC'
            }));

            const edges = routes.map(route => ({
                from: route.from,
                to: route.to,
                label: route.weight.toString(),
                arrows: isDirected ? 'to' : '',
                color: '#848484'
            }));

            console.log("Nodos", nodes);
            console.log("aristas", edges);

            const container = document.getElementById('graphContainer');
            const data = { nodes: nodes, edges: edges};
            const options = {
                physics: { enabled: true },
                edges: {
                    font: { size: 14 }
                }
            };

            new vis.Network(container, data, options);
        }
        
        function populateDropdowns(vertices) {
            const origenSelect = document.getElementById('origen');
            const destinoSelect = document.getElementById('destino');

            origenSelect.innerHTML = '<option value="">Selecciona origen</option>';
            destinoSelect.innerHTML = '<option value="">Selecciona destino</option>';

            vertices.forEach(function(vertex) {
                const optionOrigen = document.createElement('option');
                optionOrigen.value = vertex;
                optionOrigen.textContent = vertex;
                origenSelect.appendChild(optionOrigen);

                const optionDestino = document.createElement('option');
                optionDestino.value = vertex;
                optionDestino.textContent = vertex;
                destinoSelect.appendChild(optionDestino);
            });

            origenSelect.disabled = false;
            destinoSelect.disabled = false;
            document.getElementById('calculateRoute').disabled = false;
        }

        displayMatrix(matrix, vertexList);
        displayGraph(routes, vertexList, isDirected);
        populateDropdowns(vertexList);
    });

    const calculateButton = document.getElementById('calculateRoute');
    calculateButton.addEventListener('click', function() {
        const origen = document.getElementById('origen').value;
        const destino = document.getElementById('destino').value;

        if (!origen || !destino) {
            document.getElementById('routeResult').innerHTML = "Por favor selecciona origen y destino";
            return
        }

        if (origen == destino) {
            document.getElementById('routeResult').innerHTML = "El origen y destino no pueden ser iguales";
            return
        }

        const result = dijkstra(matrix, vertexList, origen, destino);

        function reconstructPath(previous, vertices, startIndex, endIndex) {
            const path = [];
            let currentIndex = endIndex;

            while (currentIndex !== null) {
                path.unshift(vertices[currentIndex]);
                currentIndex = previous[currentIndex];
            }

            return path;
        }

        const startIndex = vertexList.indexOf(origen);
        const endIndex = vertexList.indexOf(destino);

        if (result.distances[endIndex] === Infinity) {
            document.getElementById('routeResult').innerHTML = `No existe ruta entre ${origen} y ${destino}`;
        } else {
            const path = reconstructPath(result.previous, vertexList, startIndex, endIndex);
            const distance = result.distances[endIndex];

            document.getElementById('routeResult').innerHTML = `Ruta más corta ${path.join(' → ')} <br>Distancia total: ${distance}`;
        }
    })
});