document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // SCROLL REVEAL (Intersection Observer)
    // ----------------------------------------------------
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card, .data-table, .simulation-container').forEach((el, ind) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = `all 0.5s ease ${ind % 3 * 0.1}s`;
        observer.observe(el);
    });

    // ----------------------------------------------------
    // SIMULATION 1: Fault Tolerance & Replication
    // ----------------------------------------------------
    const servers = document.querySelectorAll('.sim-server');
    const ftRequestBtn = document.getElementById('ft-request-btn');
    const ftLog = document.getElementById('ft-log');
    
    servers.forEach(server => {
        server.addEventListener('click', () => {
            server.classList.toggle('active');
            server.classList.toggle('offline');
            if(server.classList.contains('offline')) {
                ftLog.innerHTML = `> Server ${server.dataset.id} crashed/disconnected.<br>` + ftLog.innerHTML;
            } else {
                ftLog.innerHTML = `> Server ${server.dataset.id} recovered.<br>` + ftLog.innerHTML;
            }
        });
    });

    ftRequestBtn.addEventListener('click', () => {
        ftRequestBtn.disabled = true;
        const activeServers = document.querySelectorAll('.sim-server.active');
        
        ftLog.innerHTML = `> Client requesting file /docs/system_arch.pdf...<br>` + ftLog.innerHTML;
        
        setTimeout(() => {
            if(activeServers.length > 0) {
                // Return from first available server
                const respondingServer = activeServers[0].dataset.id;
                ftLog.innerHTML = `> <span style="color:var(--success)">SUCCESS: Data returned from Server ${respondingServer}. Resilience active.</span><br>` + ftLog.innerHTML;
            } else {
                // All servers down
                ftLog.innerHTML = `> <span style="color:red">ERROR: Service Unavailable. All replicas offline.</span><br>` + ftLog.innerHTML;
            }
            ftRequestBtn.disabled = false;
        }, 600);
    });

    // ----------------------------------------------------
    // SIMULATION 2: Caching
    // ----------------------------------------------------
    const cacheBtn = document.getElementById('cache-request-btn');
    const cacheLog = document.getElementById('cache-log');
    const cachePacket = document.getElementById('cache-packet');
    const cacheStatus = document.getElementById('cache-status');
    let hasCache = false;

    cacheBtn.addEventListener('click', () => {
        if(cacheBtn.disabled) return;
        cacheBtn.disabled = true;
        
        const pathWidth = document.querySelector('.network-path').offsetWidth - 240; // Approx distance
        
        if(!hasCache) {
            // Uncached: Slow request to server
            cacheLog.innerHTML = "> Cache MISS. Requesting over network (slow)...<br>" + cacheLog.innerHTML;
            cachePacket.style.transition = 'none';
            cachePacket.style.left = '120px';
            cachePacket.style.background = 'var(--error)';
            cachePacket.style.opacity = '1';
            
            // Animate packet to server
            setTimeout(() => {
                cachePacket.style.transition = 'all 1s linear';
                cachePacket.style.left = `${120 + pathWidth}px`;
                
                // Server responds
                setTimeout(() => {
                    cachePacket.style.background = 'var(--success)';
                    cachePacket.style.left = '120px';
                    
                    // Client receives
                    setTimeout(() => {
                        hasCache = true;
                        cacheStatus.textContent = "Cache POPULATED";
                        cacheStatus.style.color = "var(--success)";
                        cacheLog.innerHTML = "> <span style='color:var(--success)'>File received & CACHED locally. Time: 2100ms</span><br>" + cacheLog.innerHTML;
                        cachePacket.style.opacity = '0';
                        cacheBtn.disabled = false;
                        cacheBtn.textContent = "Request File Again";
                    }, 1000);
                }, 1100);
            }, 50);

        } else {
            // Cached: Fast local return
            cacheLog.innerHTML = "> Cache HIT. Serving from local storage (fast)...<br>" + cacheLog.innerHTML;
            
            setTimeout(() => {
                cacheLog.innerHTML = "> <span style='color:var(--accent)'>File served instantly. Time: 5ms</span><br>" + cacheLog.innerHTML;
                cacheBtn.disabled = false;
            }, 300);
        }
    });

    // ----------------------------------------------------
    // SIMULATION 3: Naming & Location Transparency
    // ----------------------------------------------------
    const fetchBtn = document.getElementById('ns-fetch-btn');
    const migrateBtn = document.getElementById('ns-migrate-btn');
    const nsLog = document.getElementById('ns-log');
    const physicalTarget = document.getElementById('physical-target');
    const node1 = document.getElementById('ns-node-1');
    const node2 = document.getElementById('ns-node-2');
    const logicalInput = document.getElementById('logical-path-input');
    
    let isFileOnNode1 = true;
    
    fetchBtn.addEventListener('click', () => {
        if(fetchBtn.disabled) return;
        fetchBtn.disabled = true;
        migrateBtn.disabled = true;
        
        nsLog.innerHTML = `> Querying Directory for <span style="color:#fff">${logicalInput.value}</span>...<br>` + nsLog.innerHTML;
        
        setTimeout(() => {
            const nodeName = isFileOnNode1 ? 'Server Node 1' : 'Server Node 2';
            nsLog.innerHTML = `> Mapping found! Redirecting fetch to <span style="color:var(--success)">${nodeName}</span>.<br>` + nsLog.innerHTML;
            
            setTimeout(() => {
                nsLog.innerHTML = `> <span style="color:var(--accent)">File retrieved successfully from ${nodeName}.</span><br>` + nsLog.innerHTML;
                fetchBtn.disabled = false;
                migrateBtn.disabled = false;
            }, 600);
        }, 500);
    });

    migrateBtn.addEventListener('click', () => {
        if(migrateBtn.disabled) return;
        fetchBtn.disabled = true;
        migrateBtn.disabled = true;
        
        const oldNode = isFileOnNode1 ? 'Server Node 1' : 'Server Node 2';
        const newNode = isFileOnNode1 ? 'Server Node 2' : 'Server Node 1';
        
        nsLog.innerHTML = `> <span style="color:var(--error)">MIGRATION INITIATED:</span> Moving physical block from ${oldNode} to ${newNode}...<br>` + nsLog.innerHTML;
        
        setTimeout(() => {
            // Swap state
            isFileOnNode1 = !isFileOnNode1;
            
            // Update Directory UI
            physicalTarget.textContent = `${newNode}`;
            
            // Update node visuals
            if(isFileOnNode1) {
                node1.style.background = 'rgba(16, 185, 129, 0.2)';
                node1.style.borderColor = 'var(--success)';
                node1.innerHTML = 'Server Node 1 <br><small>Has File</small>';
                node2.style.background = 'rgba(56, 189, 248, 0.1)';
                node2.style.borderColor = 'var(--accent)';
                node2.innerHTML = 'Server Node 2 <br><small>Empty</small>';
            } else {
                node2.style.background = 'rgba(16, 185, 129, 0.2)';
                node2.style.borderColor = 'var(--success)';
                node2.innerHTML = 'Server Node 2 <br><small>Has File</small>';
                node1.style.background = 'rgba(56, 189, 248, 0.1)';
                node1.style.borderColor = 'var(--accent)';
                node1.innerHTML = 'Server Node 1 <br><small>Empty</small>';
            }
            
            nsLog.innerHTML = `> <span style="color:var(--success)">MIGRATION COMPLETE.</span> Notice the Logical File Path <span style="color:#fff">${logicalInput.value}</span> has NOT changed.<br>` + nsLog.innerHTML;
            
            // Re-enable
            setTimeout(() => {
                fetchBtn.disabled = false;
                migrateBtn.disabled = false;
            }, 300);
            
        }, 1200);
    });

    // ----------------------------------------------------
    // SIMULATION 5: Consistent Hashing Ring
    // ----------------------------------------------------
    const addNodeBtn = document.getElementById('hash-add-node-btn');
    const addDataBtn = document.getElementById('hash-add-data-btn');
    const resetRingBtn = document.getElementById('hash-reset-btn');
    const hashRing = document.getElementById('hash-ring');
    const hashLog = document.getElementById('hash-log');

    let ringNodes = [];
    let ringData = [];

    function hUpdateRingDOM() {
        if(!hashRing) return;
        hashRing.innerHTML = '';
        ringNodes.sort((a,b) => a.angle - b.angle);

        // Render nodes
        ringNodes.forEach((node) => {
            const el = document.createElement('div');
            el.className = 'sim-server';
            el.style.position = 'absolute';
            el.style.width = '24px';
            el.style.height = '24px';
            el.style.borderRadius = '50%';
            el.style.padding = '0';
            el.style.margin = '0';
            el.style.background = `hsl(${Math.floor(node.angle)}, 80%, 50%)`;
            el.style.border = '2px solid #fff';
            el.style.boxShadow = `0 0 15px hsl(${Math.floor(node.angle)}, 80%, 50%)`;
            
            const rad = (node.angle - 90) * (Math.PI / 180);
            const x = 125 + 125 * Math.cos(rad) - 12; // Radius 125, box 250
            const y = 125 + 125 * Math.sin(rad) - 12;
            
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            hashRing.appendChild(el);
        });

        // Render data 
        ringData.forEach(data => {
            const el = document.createElement('div');
            el.style.position = 'absolute';
            el.style.width = '12px';
            el.style.height = '12px';
            el.style.borderRadius = '3px';
            el.style.background = '#fff';
            
            let assigned = ringNodes.find(n => n.angle >= data.angle);
            if (!assigned && ringNodes.length > 0) assigned = ringNodes[0]; 
            
            if (assigned) {
                el.style.background = `hsl(${Math.floor(assigned.angle)}, 80%, 50%)`;
            }

            const rad = (data.angle - 90) * (Math.PI / 180);
            const x = 125 + 100 * Math.cos(rad) - 6; 
            const y = 125 + 100 * Math.sin(rad) - 6;
            
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            hashRing.appendChild(el);
        });
        
        if(hashLog) hashLog.textContent = `Active Ring Topology: ${ringNodes.length} Nodes mapping ${ringData.length} Data Blocks.`;
    }

    if (addNodeBtn) {
        addNodeBtn.addEventListener('click', () => {
            ringNodes.push({ angle: Math.floor(Math.random() * 360) });
            hUpdateRingDOM();
        });
        addDataBtn.addEventListener('click', () => {
            ringData.push({ angle: Math.floor(Math.random() * 360) });
            hUpdateRingDOM();
        });
        resetRingBtn.addEventListener('click', () => {
            ringNodes = [];
            ringData = [];
            hUpdateRingDOM();
        });
    }

    // ----------------------------------------------------
    // SIMULATION 6: Real-World DFS Architecture Simulators
    // ----------------------------------------------------
    const tabBtns = document.querySelectorAll('.sim-tab-btn');
    const stagePanels = document.querySelectorAll('.sim-stage-panel');

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset colors
            tabBtns.forEach(b => b.style.background = 'var(--bg-dark)');
            btn.style.background = 'var(--accent-hover)';
            
            // Hide all panels
            stagePanels.forEach(p => p.style.display = 'none');
            
            // Show target
            document.getElementById(btn.dataset.target).style.display = 'flex';
        });
    });

    // HDFS Simulation
    const btnHdfs = document.getElementById('btn-hdfs-upload');
    const hdfsFile = document.getElementById('hdfs-file');
    const hdfsBlocks = document.getElementById('hdfs-blocks');
    const dn1Log = document.getElementById('hdfs-dn1-log');
    const dn2Log = document.getElementById('hdfs-dn2-log');
    const dn3Log = document.getElementById('hdfs-dn3-log');

    btnHdfs.addEventListener('click', () => {
        if(btnHdfs.disabled) return;
        btnHdfs.disabled = true;
        
        hdfsFile.style.opacity = '0.3';
        hdfsBlocks.style.opacity = '1';
        
        dn1Log.textContent = 'Receiving B1...';
        dn2Log.textContent = 'Receiving B2...';
        dn3Log.textContent = 'Receiving B3, B4...';
        
        setTimeout(() => {
            dn1Log.innerHTML = '<span style="color:var(--success)">Stored: B1, Replica(B2)</span>';
            dn2Log.innerHTML = '<span style="color:var(--success)">Stored: B2, Replica(B3)</span>';
            dn3Log.innerHTML = '<span style="color:var(--success)">Stored: B3, B4, Replica(B1)</span>';
            
            setTimeout(() => {
                // Reset
                hdfsFile.style.opacity = '1';
                hdfsBlocks.style.opacity = '0';
                dn1Log.textContent = 'Ready';
                dn2Log.textContent = 'Ready';
                dn3Log.textContent = 'Ready';
                btnHdfs.disabled = false;
            }, 4000);
        }, 1500);
    });

    // NFS Simulation
    const btnNfs = document.getElementById('btn-nfs-mount');
    const nfsMountPoint = document.getElementById('nfs-mount-point');
    const nfsLink = document.getElementById('nfs-link');

    btnNfs.addEventListener('click', () => {
        if(btnNfs.disabled) return;
        btnNfs.disabled = true;
        
        nfsLink.style.opacity = '1';
        
        setTimeout(() => {
            nfsMountPoint.style.color = 'var(--success)';
            nfsMountPoint.innerHTML = 'remote_data/ <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─ db_backups/ <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ shared_vids/';
            
            setTimeout(() => {
                nfsLink.style.opacity = '0';
                nfsMountPoint.style.color = 'var(--text-secondary)';
                nfsMountPoint.innerHTML = 'remote_data (empty)';
                btnNfs.disabled = false;
            }, 5000);
        }, 800);
    });

    // S3 Simulation
    const btnS3 = document.getElementById('btn-s3-upload');
    const s3Input = document.getElementById('s3-input');
    const s3Bucket = document.getElementById('s3-bucket-contents');

    btnS3.addEventListener('click', () => {
        if(!s3Input.value.trim()) return;
        
        const newObj = document.createElement('div');
        newObj.style.background = 'rgba(255,255,255,0.05)';
        newObj.style.padding = '0.8rem';
        newObj.style.borderRadius = '4px';
        newObj.style.borderLeft = '3px solid var(--accent)';
        newObj.style.opacity = '0';
        newObj.style.transition = '0.3s';
        
        const sizeKB = Math.floor(Math.random() * 500) + 12;
        newObj.innerHTML = `Key: <span style="color:var(--text-primary)">${s3Input.value}</span><br><small style="color:var(--text-secondary);">Size: ${sizeKB}KB <br>UUID: ${Math.random().toString(36).substring(2,8)}</small>`;
        
        s3Bucket.appendChild(newObj);
        
        // Trigger reflow
        void newObj.offsetWidth;
        newObj.style.opacity = '1';
        
        s3Input.value = `data_${Math.floor(Math.random()*1000)}.bin`;
    });
});
