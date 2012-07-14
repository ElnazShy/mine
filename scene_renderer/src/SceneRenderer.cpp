/*
  Author  : Jihoon Lee
  Date    : Jun. 2012

  SceneRenderer.cpp
 */

#include<scene_renderer/SceneRenderer.h>

namespace scene_renderer {

  SceneRenderer::SceneRenderer(int argc,char** argv)
  {
    std::string service_name;
    // initialize publishers
    cloud_publisher = nh.advertise<PointCloud>(CLOUD_OUT,100);
    marker_publisher = nh.advertise<visualization_msgs::MarkerArray>(MARKER_OUT,100);

    // find_bounding_box
	  /*
    nh.param<std::string>("find_bounding_srv",service_name, find_bounding_box_name);
    while (!ros::service::waitForService(service_name, ros::Duration(2.0)) && nh.ok())
    {
      ROS_INFO("Waiting for %s service to come up",service_name.c_str());
    }
    if(!nh.ok()) exit(0);
    find_bounding_box_srv = nh.serviceClient<object_manipulation_msgs::FindClusterBoundingBox2>(service_name,true);
    */

    // initialize subcriber
    std::string cloud = CLOUD_IN;
    if(ros::names::remap(cloud) == cloud) {
      ROS_WARN("Topic 'cloud_in' has not been remapped");
    }
    cloud_sub = nh.subscribe(cloud,5,&SceneRenderer::processCloud,this);

    min_cluster_size = 300;
    max_cluster_size = 400;
    cluster_distance = 0.0;

    patch_width = 640 / 20;
    patch_height = 480 / 20;
	  patches.resize(patch_width * patch_height);
  }

  SceneRenderer::~SceneRenderer()
  {
  }

  void SceneRenderer::processCloud(const sensor_msgs::PointCloud2::ConstPtr& msg)
  {
    ROS_INFO("In process cloud");
    std::vector<PointCloud> clusters;
    PointCloud::Ptr cloud(new PointCloud());

    convertToWorldFrame(msg,cloud);
	  updateWorld(cloud);

	  cloud_publisher.publish(*cloud);

	  ROS_INFO(" ");
  //  publishClusters(clusters);
  }

  // This function receives point cloud2, converts to pcl::pointcloud, and transform to world frame
  void SceneRenderer::convertToWorldFrame(const sensor_msgs::PointCloud2::ConstPtr& msg,PointCloud::Ptr cloud)
  {
    PointCloud::Ptr cloud_before(new PointCloud());
    pcl::fromROSMsg(*msg,*cloud_before);
    pcl_ros::transformPointCloud(processing_frame,*cloud_before,*cloud,tflistener);
  }

  void SceneRenderer::updateWorld(PointCloud::Ptr cloud)
  {
	  unsigned int i,j;
	  unsigned int width = cloud->width;
	  unsigned int height = cloud->height;
	  unsigned int index,index2;
	  std::vector<PointCloud> clusters;
	  clusters.resize(patch_height * patch_width);

	  index = 0;
	  index2 = 0;

	  ROS_INFO("width = %d",cloud->width);
	  ROS_INFO("height = %d",cloud->height);

	  // chop it into piece
	  for(j = 0;j < height; j++)
	  {
		  index2 = (j / patch_height) * patch_width;
		  for(i =0;i < width; i++)
		  {
			  index = (i / patch_width) + index2; 
			  clusters[index].points.push_back(cloud->points[ i + (j * width)]);
		  }
	  }
  }

  void SceneRenderer::spin()
  {
    while(ros::ok())
    {
      //publishClusters(patches);
      ros::spinOnce();
      ros::Duration(0.1f).sleep();
    }
  }
}
 
int main(int argc,char** argv)
{
  ros::init(argc,argv,"scene_renderer");

  scene_renderer::SceneRenderer sr(argc,argv);
  ROS_INFO("Scene Renderer initialized");
  sr.spin();
  ROS_INFO("Done");

  return 0;
}
